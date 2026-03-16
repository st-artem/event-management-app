import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; 
import { Event } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity'; 

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Tag) 
    private tagsRepository: Repository<Tag>,
  ) {}

  private async processTags(tagNames?: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const normalizedNames = tagNames.map(name => name.toLowerCase().trim());

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

  async findAll(tagNames?: string[]): Promise<Event[]> {
    if (!tagNames || tagNames.length === 0) {
      return this.eventsRepository.find({ relations: ['organizer', 'participants', 'tags'] });
    }

    const normalizedTags = tagNames.map(t => t.toLowerCase());

    return this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tag')
      .where('tag.name IN (:...tags)', { tags: normalizedTags })
      .getMany();
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
    const event = await this.findOne(eventId);
    
    if (event.organizer.id === userId) {
      throw new BadRequestException('You are the organizer of this event');
    }

    const isAlreadyParticipant = event.participants.some(user => user.id === userId);
    if (isAlreadyParticipant) {
      throw new BadRequestException('You are already participating in this event');
    }

    if (event.capacity && event.participants.length >= event.capacity) {
      throw new BadRequestException('No more spots available for this event');
    }

    event.participants.push({ id: userId } as User);
    return this.eventsRepository.save(event);
  }

  async leaveEvent(eventId: number, userId: number) {
    const event = await this.findOne(eventId);
    event.participants = event.participants.filter(user => user.id !== userId);
    return this.eventsRepository.save(event);
  }

  async update(id: number, updateEventDto: any, userId: number): Promise<Event> {
    const event = await this.findOne(id);
    
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You can only edit your own events');
    }

    const { tags, ...eventData } = updateEventDto;

    if (tags) {
      event.tags = await this.processTags(tags);
    }

    Object.assign(event, eventData);
    return this.eventsRepository.save(event);
  }

  async remove(id: number, userId: number): Promise<void> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });

    if (!event) {
      throw new Error('Event not found'); 
    }
    
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    if (event.participants && event.participants.length > 0) {
      event.participants = [];
      await this.eventsRepository.save(event);
    }

    await this.eventsRepository.remove(event);
  }
}