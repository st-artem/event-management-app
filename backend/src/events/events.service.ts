import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: any, userId: number): Promise<Event> {
    const newEvent = this.eventsRepository.create({
      ...createEventDto,
      organizer: { id: userId },
    } as Partial<Event>); 
    
    return this.eventsRepository.save(newEvent);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({ relations: ['organizer'] });
  }
}