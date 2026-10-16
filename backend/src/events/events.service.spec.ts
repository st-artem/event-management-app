import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { Tag } from '../tags/entities/tag.entity';

const ORGANIZER_ID = 1;
const USER_ID = 2;

const buildEvent = (overrides: Partial<Event> = {}): Event =>
  ({
    id: 10,
    title: 'Meetup',
    capacity: 2,
    organizer: { id: ORGANIZER_ID },
    participants: [],
    tags: [],
    ...overrides,
  }) as Event;

describe('EventsService', () => {
  let service: EventsService;

  const relationQuery = {
    of: jest.fn().mockReturnThis(),
    add: jest.fn(),
    remove: jest.fn(),
  };
  const relationBuilder = { relation: jest.fn(() => relationQuery) };

  const lockedEventQuery = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const participantsQuery = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const manager = {
    getRepository: jest.fn(entity => ({
      createQueryBuilder: () => (entity === Event ? lockedEventQuery : participantsQuery),
    })),
    createQueryBuilder: jest.fn(() => relationBuilder),
  };

  const eventsRepository = {
    findOne: jest.fn(),
    save: jest.fn(event => Promise.resolve(event)),
    remove: jest.fn(),
    create: jest.fn(data => data),
    createQueryBuilder: jest.fn(() => relationBuilder),
  };

  const dataSource = {
    transaction: jest.fn(callback => callback(manager)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: eventsRepository },
        { provide: getRepositoryToken(Tag), useValue: { find: jest.fn().mockResolvedValue([]), create: jest.fn() } },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  describe('joinEvent', () => {
    it('should add participant when there are free spots', async () => {
      lockedEventQuery.getOne.mockResolvedValue(buildEvent());
      participantsQuery.getMany.mockResolvedValue([]);
      eventsRepository.findOne.mockResolvedValue(buildEvent({ participants: [{ id: USER_ID } as any] }));

      await service.joinEvent(10, USER_ID);

      expect(relationQuery.add).toHaveBeenCalledWith(USER_ID);
    });

    it('should not let organizer join own event', async () => {
      lockedEventQuery.getOne.mockResolvedValue(buildEvent());

      await expect(service.joinEvent(10, ORGANIZER_ID)).rejects.toThrow(BadRequestException);
      expect(relationQuery.add).not.toHaveBeenCalled();
    });

    it('should not join twice', async () => {
      lockedEventQuery.getOne.mockResolvedValue(buildEvent());
      participantsQuery.getMany.mockResolvedValue([{ id: USER_ID }]);

      await expect(service.joinEvent(10, USER_ID)).rejects.toThrow('already participating');
    });

    it('should not join a full event', async () => {
      lockedEventQuery.getOne.mockResolvedValue(buildEvent({ capacity: 2 }));
      participantsQuery.getMany.mockResolvedValue([{ id: 3 }, { id: 4 }]);

      await expect(service.joinEvent(10, USER_ID)).rejects.toThrow('No more spots');
      expect(relationQuery.add).not.toHaveBeenCalled();
    });

    it('should throw when event does not exist', async () => {
      lockedEventQuery.getOne.mockResolvedValue(null);

      await expect(service.joinEvent(999, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('leaveEvent', () => {
    it('should reject user who is not a participant', async () => {
      eventsRepository.findOne.mockResolvedValue(buildEvent());

      await expect(service.leaveEvent(10, USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('should remove participant', async () => {
      eventsRepository.findOne.mockResolvedValue(buildEvent({ participants: [{ id: USER_ID } as any] }));

      await service.leaveEvent(10, USER_ID);

      expect(relationQuery.remove).toHaveBeenCalledWith(USER_ID);
    });
  });

  describe('update', () => {
    it('should forbid editing someone else event', async () => {
      eventsRepository.findOne.mockResolvedValue(buildEvent());

      await expect(service.update(10, { title: 'Hacked' }, USER_ID)).rejects.toThrow(ForbiddenException);
      expect(eventsRepository.save).not.toHaveBeenCalled();
    });

    it('should not reduce capacity below current participants', async () => {
      eventsRepository.findOne.mockResolvedValue(
        buildEvent({ capacity: 5, participants: [{ id: 3 }, { id: 4 }, { id: 5 }] as any }),
      );

      await expect(service.update(10, { capacity: 2 }, ORGANIZER_ID)).rejects.toThrow(BadRequestException);
    });

    it('should save changes made by organizer', async () => {
      eventsRepository.findOne.mockResolvedValue(buildEvent());

      const updated = await service.update(10, { title: 'New title' }, ORGANIZER_ID);

      expect(updated.title).toBe('New title');
    });
  });

  describe('remove', () => {
    it('should return 404 for missing event', async () => {
      eventsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, ORGANIZER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should forbid deleting someone else event', async () => {
      eventsRepository.findOne.mockResolvedValue(buildEvent());

      await expect(service.remove(10, USER_ID)).rejects.toThrow(ForbiddenException);
      expect(eventsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
