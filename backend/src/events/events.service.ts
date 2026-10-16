import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Event } from './entities/event.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private dataSource: DataSource,
  ) {}

  private async processTags(tagNames?: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const normalizedNames = [...new Set(tagNames.map(name => name.toLowerCase().trim()))];

    const existingTags = await this.tagsRepository.find({
      where: { name: In(normalizedNames) },
    });

    const existingTagNames = existingTags.map(tag => tag.name);
    const newTagNames = normalizedNames.filter(
      name => !existingTagNames.includes(name)
    );

    const newTags = newTagNames.map(name => this.tagsRepository.create({ name }));

    return [...existingTags, ...newTags];
  }

  async create(createEventDto: any, userId: number): Promise<Event> {
    const { tags, ...eventData } = createEventDto;

    const newEvent = this.eventsRepository.create({
      ...eventData,
      organizer: { id: userId },
    } as Partial<Event>);

    if (tags && tags.length > 0) {
      newEvent.tags = await this.processTags(tags);
    }

    return this.eventsRepository.save(newEvent);
  }

  // Публічний каталог: приватні події доступні лише за прямим посиланням і в "My Events"
  async findAll(tagNames?: string[]): Promise<Event[]> {
    const query = this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tag')
      .where('event.isPublic = :isPublic', { isPublic: true })
      .orderBy('event.dateTime', 'ASC');

    if (tagNames && tagNames.length > 0) {
      const normalizedTags = tagNames.map(t => t.toLowerCase());
      // Окремий join для фільтра, щоб у відповіді лишались усі теги події
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('filterEvent.id')
          .from(Event, 'filterEvent')
          .innerJoin('filterEvent.tags', 'filterTag')
          .where('filterTag.name IN (:...tags)')
          .getQuery();
        return `event.id IN ${subQuery}`;
      }, { tags: normalizedTags });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'tags']
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async joinEvent(eventId: number, userId: number) {
    await this.dataSource.transaction(async manager => {
      // Блокуємо рядок події, щоб паралельні join не перевищили capacity
      const event = await manager.getRepository(Event)
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.organizer', 'organizer')
        .setLock('pessimistic_write', undefined, ['event'])
        .where('event.id = :eventId', { eventId })
        .getOne();

      if (!event) throw new NotFoundException('Event not found');

      if (event.organizer.id === userId) {
        throw new BadRequestException('You are the organizer of this event');
      }

      const participantIds = (await manager.getRepository(User)
        .createQueryBuilder('user')
        .innerJoin('user.attendedEvents', 'attended', 'attended.id = :eventId', { eventId })
        .select('user.id')
        .getMany()).map(user => user.id);

      if (participantIds.includes(userId)) {
        throw new BadRequestException('You are already participating in this event');
      }

      if (event.capacity && participantIds.length >= event.capacity) {
        throw new BadRequestException('No more spots available for this event');
      }

      await manager.createQueryBuilder().relation(Event, 'participants').of(eventId).add(userId);
    });

    return this.findOne(eventId);
  }

  async leaveEvent(eventId: number, userId: number) {
    const event = await this.findOne(eventId);

    if (!event.participants.some(user => user.id === userId)) {
      throw new BadRequestException('You are not participating in this event');
    }

    await this.eventsRepository.createQueryBuilder().relation(Event, 'participants').of(eventId).remove(userId);

    return this.findOne(eventId);
  }

  async update(id: number, updateEventDto: any, userId: number, isAdmin = false): Promise<Event> {
    const event = await this.findOne(id);

    if (event.organizer.id !== userId && !isAdmin) {
      throw new ForbiddenException('You can only edit your own events');
    }

    const { tags, ...eventData } = updateEventDto;

    if (eventData.capacity && eventData.capacity < event.participants.length) {
      throw new BadRequestException(
        `Capacity cannot be less than the current number of participants (${event.participants.length})`,
      );
    }

    if (tags) {
      event.tags = await this.processTags(tags);
    }

    Object.assign(event, eventData);

    return this.eventsRepository.save(event);
  }

  async remove(id: number, userId: number, isAdmin = false): Promise<void> {
    const event = await this.findOne(id);

    if (event.organizer.id !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own events');
    }

    if (event.participants.length > 0) {
      event.participants = [];
      await this.eventsRepository.save(event);
    }

    await this.eventsRepository.remove(event);
  }
}
