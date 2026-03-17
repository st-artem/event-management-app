import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('AI Assistant') 
@ApiBearerAuth() 
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard) 
  @Post('ask')
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        query: { type: 'string', example: 'Які в мене плани на сьогодні?' } 
      } 
    } 
  }) 
  async askAssistant(@Request() req, @Body('query') query: string) {
    if (!query) {
      throw new BadRequestException('Питання не може бути порожнім');
    }

    const userId = req.user.sub || req.user.id; 
    return this.aiService.askAssistant(userId, query);
  }
}