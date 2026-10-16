import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAllUsers() {
    return this.usersRepository
      .createQueryBuilder('user')
      .loadRelationCountAndMap('user.organizedCount', 'user.organizedEvents')
      .loadRelationCountAndMap('user.attendedCount', 'user.attendedEvents')
      .orderBy('user.id', 'ASC')
      .getMany();
  }

  // Усі події, включно з приватними
  async findAllEvents() {
    return this.eventsRepository.find({
      relations: ['organizer', 'participants', 'tags'],
      order: { dateTime: 'ASC' },
    });
  }

  async updateUserRole(id: number, role: 'user' | 'admin', adminId: number) {
    if (id === adminId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    user.role = role;
    return this.usersRepository.save(user);
  }

  async removeUser(id: number, adminId: number) {
    if (id === adminId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);

    // Спершу участі та події користувача: FK participants -> events без каскаду
    await this.usersRepository.manager.transaction(async manager => {
      await manager
        .createQueryBuilder()
        .delete()
        .from('participants')
        .where('"usersId" = :id', { id })
        .orWhere('"eventsId" IN (SELECT id FROM events WHERE "organizerId" = :id)', { id })
        .execute();
      await manager.delete(Event, { organizer: { id } });
      await manager.delete(User, { id });
    });
  }
}
