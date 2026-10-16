import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    findOne: jest.fn(),
    save: jest.fn(user => Promise.resolve(user)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should throw when user is not found', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.findById(42)).rejects.toThrow(NotFoundException);
  });

  it('should update profile fields', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 1, name: 'Old', email: 'a@example.com' });

    const updated = await service.updateProfile(1, { name: 'New', bio: 'Hello' });

    expect(updated).toMatchObject({ id: 1, name: 'New', bio: 'Hello', email: 'a@example.com' });
  });
});
