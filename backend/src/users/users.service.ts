import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { type UpdateProfileDto } from '../types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // passwordHash має select: false, тому для логіну підтягуємо його явно
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(name: string, email: string, passwordHash: string): Promise<User> {
    const newUser = this.usersRepository.create({ name, email, passwordHash });
    return this.usersRepository.save(newUser);
  }

  async findById(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User #${userId} not found`);
    return user;
  }

  async getMyEvents(userId: number) {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: [
        'organizedEvents',
        'organizedEvents.tags',
        'attendedEvents',
        'attendedEvents.tags',
      ],
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }
}
