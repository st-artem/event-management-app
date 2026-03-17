import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  constructor(private usersService: UsersService) {}

  async askAssistant(userId: number, userQuery: string) {
    const userWithEvents = await this.usersService.getMyEvents(userId);

    if (!userWithEvents) {
      throw new NotFoundException('Користувача не знайдено');
    }

    const myPlans = userWithEvents.attendedEvents?.map(e => ({
      title: e.title,
      date: e.dateTime,
      tags: e.tags?.map(t => t.name) || []
    })) || [];

    const myOrganized = userWithEvents.organizedEvents?.map(e => ({
      title: e.title,
      date: e.dateTime,
      tags: e.tags?.map(t => t.name) || []
    })) || [];

    const contextData = {
      goingTo: myPlans,
      organizing: myOrganized
    };

    const systemPrompt = `
      Ти корисний AI-асистент у додатку для планування подій.
      Поточна дата і час: ${new Date().toLocaleString('uk-UA')}.
      
      Ось розклад користувача у форматі JSON:
      ${JSON.stringify(contextData)}

      Твоя задача: відповідати на питання користувача щодо його розкладу.
      Правила:
      1. Будь лаконічним, дружнім і відповідай мовою запиту.
      2. Не вигадуй події, яких немає в JSON.
      3. Якщо питання взагалі не стосується подій чи розкладу, скажи, що ти можеш допомогти лише з плануванням.
    `;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }, 
        { role: 'user', content: userQuery }       
      ],
      model: 'llama-3.1-8b-instant', 
      temperature: 0.5, 
    });

    return {
      answer: chatCompletion.choices[0]?.message?.content || 'Вибачте, я не зміг обробити запит.'
    };
  }
}