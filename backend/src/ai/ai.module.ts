import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; 
import { EventsModule } from '../events/events.module'; 

@Module({
  imports: [UsersModule, AuthModule, EventsModule], 
  providers: [AiService],
  controllers: [AiController]
})
export class AiModule {}