import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { AuthModule } from '../auth/auth.module';
import { Tag } from '../tags/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Tag]),
    AuthModule, 
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}