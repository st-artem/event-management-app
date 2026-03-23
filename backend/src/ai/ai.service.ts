import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service'; 
import Groq from 'groq-sdk';


@Injectable()
export class AiService {
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  constructor(
    private usersService: UsersService,
    private eventsService: EventsService
  ) {}

  async askAssistant(userId: number, messages: any[]) {
    const userWithEvents = await this.usersService.getMyEvents(userId);

    if (!userWithEvents) {
      throw new NotFoundException('User not found');
    }

    const allEventsRaw = await this.eventsService.findAll();

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

    const allPublicEvents = allEventsRaw.map(e => ({
      title: e.title,
      date: e.dateTime,
      tags: e.tags?.map(t => t.name) || [],
      attendees: e.participants?.map(a => a.email) || [] 
    }));

    const contextData = {
      mySchedule: {
        goingTo: myPlans,
        organizing: myOrganized
      },
      allPublicEvents: allPublicEvents
    };

    const systemPrompt = `
      You are a read-only AI Assistant for an event planning application.
      Current date and time: ${new Date().toLocaleString('en-US')}.
      
      Here is the JSON data of the user's schedule and all public events (with tags and attendees):
      ${JSON.stringify(contextData)}

      RULES & CAPABILITIES:
      1. You can count events, list upcoming/past events, filter by tags, and show participants.
      2. Answer concisely in plain English text. Do NOT use Markdown formatting (no asterisks, no bold text, no lists formatting).
      3. You cannot create, edit, or delete events.
      4. CRITICAL FALLBACK RULE: If the user's question is unclear, unsupported, or completely unrelated to events, schedules, or tags, you MUST reply EXACTLY with this phrase and nothing else:
      "Sorry, I didn’t understand that. Please try rephrasing your question."
    `;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }, 
        ...messages      
      ],
      model: 'llama-3.1-8b-instant', 
      temperature: 0.1, 
    });

    return {
      answer: chatCompletion.choices[0]?.message?.content || 'Sorry, I didn’t understand that. Please try rephrasing your question.'
    };
  }
}