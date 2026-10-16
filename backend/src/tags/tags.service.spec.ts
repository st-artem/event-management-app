import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';

describe('TagsService', () => {
  let service: TagsService;
  const tagsRepository = {
    findOne: jest.fn(),
    create: jest.fn(data => data),
    save: jest.fn(tag => Promise.resolve({ id: 'uuid', ...tag })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: tagsRepository },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('should normalize tag name', async () => {
    tagsRepository.findOne.mockResolvedValue(null);

    await expect(service.create('  Tech ')).resolves.toEqual({ id: 'uuid', name: 'tech' });
  });

  it('should not create a duplicate tag', async () => {
    tagsRepository.findOne.mockResolvedValue({ id: 'uuid', name: 'tech' });

    await expect(service.create('TECH')).rejects.toThrow(ConflictException);
  });
});
