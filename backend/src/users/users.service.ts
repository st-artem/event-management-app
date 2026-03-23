import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { type UpdateProfileDto } from 'src/types';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(name: string, email: string, passwordHash: string): Promise<User> {
    const newUser = this.usersRepository.create({ name, email, passwordHash });
    return this.usersRepository.save(newUser);
  }

  async findById(userId: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: [
        'organizedEvents',
        'organizedEvents.tags',
        'attendedEvents',
        'attendedEvents.tags',
      ],
    });

    if (!user) throw new NotFoundException(`User #${userId} not found`);

    const { passwordHash, ...safeUser } = user;
    return safeUser;
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

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    Object.assign(user, dto);
    await this.usersRepository.save(user);

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}