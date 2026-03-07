import { Controller, Post, Body, Get, UsePipes, UseGuards, Request as Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { createEventSchema } from './dto/event.schema';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) 
  @ApiBearerAuth() 
  @UsePipes(new YupValidationPipe(createEventSchema))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'IT Conference 2026' },
        description: { type: 'string', example: 'Discussing the future of web development.' },
        dateTime: { type: 'string', format: 'date-time', example: '2026-05-20T10:00:00Z' },
        location: { type: 'string', example: 'Vinnytsia IT Hub' },
        capacity: { type: 'number', example: 100 },
        isPublic: { type: 'boolean', example: true },
      },
    },
  })
  create(@Body() body: any, @Req() req: any) {
    return this.eventsService.create(body, req.user.sub);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll(); 
  }
}