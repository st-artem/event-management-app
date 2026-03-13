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
        title: 'IT Vinnytsia Meetup #12',
        description: 'Щомісячна зустріч IT-спільноти Вінниці. Доповіді про React 19, NestJS та кар\'єрні поради від Senior розробників.',
        dateTime: new Date(Date.now() + 86400000 * 7).toISOString(),
        location: 'VTEM, вул. Соборна 16, Вінниця',
        capacity: 80,
        isPublic: true,
        organizer: user1
    },
    {
        title: 'Вінниця Half Marathon 2026',
        description: 'Щорічний півмарафон вздовж набережної Південного Бугу. Дистанції 5км, 10км та 21км. Реєстрація обов\'язкова.',
        dateTime: new Date(Date.now() + 86400000 * 14).toISOString(),
        location: 'Центральний парк, набережна, Вінниця',
        capacity: 500,
        isPublic: true,
        organizer: user1
    },
    {
        title: 'UI/UX Design Workshop',
        description: 'Практичний воркшоп з Figma: від wireframe до готового прототипу. Розберемо реальні кейси вінницьких стартапів.',
        dateTime: new Date(Date.now() + 86400000 * 21).toISOString(),
        location: 'Coworking Hub, вул. Київська 5, Вінниця',
        capacity: 25,
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