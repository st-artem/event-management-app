import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
        messages: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', example: 'user' },
              content: { type: 'string', example: 'Які в мене плани на сьогодні?' }
            }
          }
        } 
      } 
    } 
  }) 
  async askAssistant(@Request() req, @Body('messages') messages: any[]) {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('Історія повідомлень не може бути порожньою');
    }

    // Лише user/assistant (без підміни system prompt) і останні 20 повідомлень
    const safeMessages = messages
      .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (safeMessages.length === 0) {
      throw new BadRequestException('Історія повідомлень не може бути порожньою');
    }

    const userId = req.user.sub || req.user.id;
    return this.aiService.askAssistant(userId, safeMessages);
  }
}