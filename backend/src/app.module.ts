import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { SeedService } from './seed.service';
import { User } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';
import { TagsModule } from './tags/tags.module';
import { AiModule } from './ai/ai.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, 
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([User, Event]), 
    UsersModule,
    EventsModule,
    AuthModule,
    TagsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService], 
})
export class AppModule {}