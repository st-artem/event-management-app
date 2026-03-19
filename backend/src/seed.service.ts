import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';
import { Tag } from './tags/entities/tag.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) {}

  async onApplicationBootstrap() {
    const usersCount = await this.userRepository.count();
    if (usersCount > 0) return;

    this.logger.log('База даних порожня. Починаю генерацію тестових даних (Seeding)...');

    // ── Users ──────────────────────────────────────────────────────────────────
    const hashedPassword = await argon2.hash('password123');

    const [user1, user2, user3] = await this.userRepository.save([
      {
        email: 'eduard@example.com',
        passwordHash: hashedPassword,
        name: 'Eduard',
        bio: 'Full-stack розробник. Люблю будувати продукти та відвідувати технічні мітапи.',
        location: 'Вінниця, Україна',
      },
      {
        email: 'anna@example.com',
        passwordHash: hashedPassword,
        name: 'Anna',
        bio: 'UI/UX дизайнер. Захоплююся чистими інтерфейсами та дослідженням користувачів.',
        location: 'Київ, Україна',
      },
      {
        email: 'max@example.com',
        passwordHash: hashedPassword,
        name: 'Max',
        bio: 'Спортсмен та організатор спільноти. Біг, велоспорт, туризм.',
        location: 'Вінниця, Україна',
      },
    ] as any);

    // ── Tags — зберігаємо по одному щоб отримати id ────────────────────────────
    const tagNames = ['Tech', 'Design', 'Sport', 'Business', 'Music', 'Art', 'Education', 'Networking'];
    const tagMap: Record<string, Tag> = {};

    for (const name of tagNames) {
      const tag = await this.tagRepository.save(this.tagRepository.create({ name }));
      tagMap[name] = tag;
    }

    // ── Events ─────────────────────────────────────────────────────────────────
    const day = 86400000;

    await this.eventRepository.save([
      {
        title: 'IT Vinnytsia Meetup #12',
        description: 'Щомісячна зустріч IT-спільноти Вінниці. Доповіді про React 19, NestJS та кар\'єрні поради від Senior розробників.',
        dateTime: new Date(Date.now() + day * 7).toISOString(),
        location: 'VTEM, вул. Соборна 16, Вінниця',
        capacity: 80,
        isPublic: true,
        organizer: user1,
        participants: [user2, user3],
        tags: [tagMap['Tech'], tagMap['Networking']],
      },
      {
        title: 'Вінниця Half Marathon 2026',
        description: 'Щорічний півмарафон вздовж набережної Південного Бугу. Дистанції 5км, 10км та 21км. Реєстрація обов\'язкова.',
        dateTime: new Date(Date.now() + day * 14).toISOString(),
        location: 'Центральний парк, набережна, Вінниця',
        capacity: 500,
        isPublic: true,
        organizer: user3,
        participants: [user1, user2],
        tags: [tagMap['Sport']],
      },
      {
        title: 'UI/UX Design Workshop',
        description: 'Практичний воркшоп з Figma: від wireframe до готового прототипу. Розберемо реальні кейси вінницьких стартапів.',
        dateTime: new Date(Date.now() + day * 21).toISOString(),
        location: 'Coworking Hub, вул. Київська 5, Вінниця',
        capacity: 25,
        isPublic: true,
        organizer: user2,
        participants: [user1],
        tags: [tagMap['Design'], tagMap['Education']],
      },
      {
        title: 'Startup Pitch Night Vinnytsia',
        description: 'Вечір стартап-пітчів від молодих підприємців регіону. 10 команд, 5 хвилин на кожну, живе голосування глядачів.',
        dateTime: new Date(Date.now() + day * 10).toISOString(),
        location: 'PMHub, вул. Театральна 11, Вінниця',
        capacity: 100,
        isPublic: true,
        organizer: user1,
        participants: [user3],
        tags: [tagMap['Business'], tagMap['Networking']],
      },
      {
        title: 'Jazz під зірками',
        description: 'Відкритий концерт джазової музики у Центральному парку. Три місцеві гурти, імпровізації та атмосфера літньої ночі.',
        dateTime: new Date(Date.now() + day * 5).toISOString(),
        location: 'Центральний парк, Вінниця',
        capacity: 300,
        isPublic: true,
        organizer: user2,
        participants: [user1, user3],
        tags: [tagMap['Music'], tagMap['Art']],
      },
      {
        title: 'Python для початківців',
        description: 'Безкоштовний інтенсив з Python для тих, хто тільки починає програмувати. Основи синтаксису, функції, робота з файлами.',
        dateTime: new Date(Date.now() + day * 30).toISOString(),
        location: 'IT School Vinnytsia, вул. Пирогова 22',
        capacity: 30,
        isPublic: true,
        organizer: user1,
        participants: [user2],
        tags: [tagMap['Tech'], tagMap['Education']],
      },
      {
        title: 'Велопробіг "Вінниця — Сутиски"',
        description: 'Груповий велопробіг 60км через мальовничі села Вінниччини. Зупинка на обід, фінішна вечеря для учасників.',
        dateTime: new Date(Date.now() + day * 18).toISOString(),
        location: 'Старт: площа Незалежності, Вінниця',
        capacity: 50,
        isPublic: true,
        organizer: user3,
        participants: [user1],
        tags: [tagMap['Sport']],
      },
      {
        title: 'Воркшоп з акварельного живопису',
        description: 'Майстер-клас для початківців та досвідчених художників. Матеріали включені у вартість. Кількість місць обмежена.',
        dateTime: new Date(Date.now() + day * 12).toISOString(),
        location: 'Art Studio Vinnytsia, вул. Замкова 3',
        capacity: 15,
        isPublic: true,
        organizer: user2,
        participants: [user3],
        tags: [tagMap['Art'], tagMap['Education']],
      },
    ] as any);

    this.logger.log('Seeding успішно завершено!');
    this.logger.log('Тестові користувачі:');
    this.logger.log('  Eduard  → eduard@example.com  / password123');
    this.logger.log('  Anna    → anna@example.com    / password123');
    this.logger.log('  Max     → max@example.com     / password123');
  }
}