import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Event) private eventRepository: Repository<Event>,
  ) {}

  async onApplicationBootstrap() {
    const usersCount = await this.userRepository.count();
    
    if (usersCount === 0) {
      this.logger.log('База даних порожня. Починаю генерацію тестових даних (Seeding)...');

      const hashedPassword = await argon2.hash('password123');

      const users = await this.userRepository.save([
        { email: 'eduard@example.com', passwordHash: hashedPassword, name: 'Eduard' },
        { email: 'test@example.com', passwordHash: hashedPassword, name: 'Test User' }
      ] as any);

      const user1 = users[0];
      const user2 = users[1];

      await this.eventRepository.save([
        {
          title: 'Tech Conference 2026', 
          description: 'Annual technology conference featuring the latest innovations in AI.', 
          dateTime: new Date(Date.now() + 86400000 * 10).toISOString(), 
          location: 'Convention Center, San Francisco', 
          capacity: 500, 
          isPublic: true, 
          organizer: user1
        },
        {
          title: 'Community Networking Meetup', 
          description: 'Connect with local professionals and expand your network.', 
          dateTime: new Date(Date.now() + 86400000 * 15).toISOString(), 
          location: 'Downtown Coffee Shop', 
          capacity: 30, 
          isPublic: true, 
          organizer: user1
        },
        {
          title: 'Design Workshop', 
          description: 'Hands-on workshop covering modern UI/UX design principles.', 
          dateTime: new Date(Date.now() + 86400000 * 20).toISOString(), 
          location: 'Creative Space Studio', 
          capacity: 20, 
          isPublic: true, 
          organizer: user2, 
          participants: [user1]
        }
      ] as any);

      this.logger.log('Скрипт успішно виконався');
      this.logger.log('Дефолтні користувачі:');
      this.logger.log('Почта: eduard@example.com Пароль: password123)');
      this.logger.log('Почта: test@example.com Пароль: password123)');
    }
  }
}