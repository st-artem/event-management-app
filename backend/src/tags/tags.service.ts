import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(name: string) {
    const normalizedName = name.toLowerCase().trim();
    const existing = await this.tagsRepository.findOne({ where: { name: normalizedName } });
    if (existing) throw new ConflictException('Tag already exists');

    return this.tagsRepository.save(this.tagsRepository.create({ name: normalizedName }));
  }

  // Топ-20 найпопулярніших тегів
  async findAll() {
    const tags = await this.tagsRepository
      .createQueryBuilder('tag')
      .loadRelationCountAndMap('tag.eventsCount', 'tag.events')
      .getMany();

    return tags
      .sort((a, b) => (b['eventsCount'] || 0) - (a['eventsCount'] || 0))
      .slice(0, 20);
  }

  async findOne(id: string) {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }
}
