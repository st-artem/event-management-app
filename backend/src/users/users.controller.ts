import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Request as Req,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { type UpdateProfileDto } from 'src/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('me/events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyEvents(@Req() req: any) {
    this.logger.log(`GET /users/me/events — userId: ${req.user.sub}`);
    return this.usersService.getMyEvents(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    this.logger.log(`PATCH /users/me — userId: ${req.user.sub}`);
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /users/${id}`);
    return this.usersService.findById(id);
  }
}