import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { createTagSchema } from './dto/tag.schema';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'tech' } } } })
  create(@Body(new YupValidationPipe(createTagSchema)) body: { name: string }) {
    return this.tagsService.create(body.name);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findOne(id);
  }
}
