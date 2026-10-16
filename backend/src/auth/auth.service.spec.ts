import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('token') };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should not register a user with an existing email', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 1 });

    await expect(service.register('Test', 'test@example.com', 'password123')).rejects.toThrow(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('should store a hashed password on register', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({ id: 1, email: 'test@example.com' });

    await service.register('Test', 'test@example.com', 'password123');

    const passwordHash = usersService.create.mock.calls[0][2];
    expect(passwordHash).not.toBe('password123');
    expect(await argon2.verify(passwordHash, 'password123')).toBe(true);
  });

  it('should return a token for valid credentials', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      passwordHash: await argon2.hash('password123'),
    });

    await expect(service.login('test@example.com', 'password123')).resolves.toEqual({ access_token: 'token' });
  });

  it('should reject a wrong password', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      passwordHash: await argon2.hash('password123'),
    });

    await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('should reject an unknown email', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(service.login('nobody@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
  });
});
