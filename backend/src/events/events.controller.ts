import { Controller, Post, Body, Get, Delete, Param, UsePipes, UseGuards, Request as Req, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new event' })
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
  @ApiOperation({ summary: 'Get all events' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join an event' })
  join(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.joinEvent(+id, req.user.sub);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave an event' })
  leave(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.leaveEvent(+id, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit an event' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Title' },
        description: { type: 'string', example: 'Updated Description' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.eventsService.update(+id, body, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.remove(+id, req.user.sub);
  }
}