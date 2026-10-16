import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    process.env.GROQ_API_KEY = 'test-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: UsersService, useValue: {} },
        { provide: EventsService, useValue: {} },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
