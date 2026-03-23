import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  async findAll() {
  return await this.tagsRepository
    .createQueryBuilder('tag')
    .loadRelationCountAndMap('tag.eventsCount', 'tag.events') 
    .getMany()
    .then(tags => 
      tags.sort((a, b) => (b['eventsCount'] || 0) - (a['eventsCount'] || 0))
          .slice(0, 20) 
    );
}

  async findMyHistory(userId: number) {
    return await this.tagsRepository
      .createQueryBuilder('tag')
      .innerJoin('events_tags_tag', 'ett', 'ett.tagId = tag.id')
      .innerJoin('event', 'e', 'e.id = ett.eventId')
      .where('e.organizerId = :userId', { userId })
      .select(['tag.id', 'tag.name'])
      .distinct(true)
      .getMany();
  }

  async findOne(id: string) { 
    return await this.tagsRepository.findOne({ 
      where: { id: id as any } 
    });
  }

  async remove(id: string) {
    return await this.tagsRepository.delete(id);
  }
}