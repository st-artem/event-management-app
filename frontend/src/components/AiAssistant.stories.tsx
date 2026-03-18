import type { Meta, StoryObj } from '@storybook/react';
import { AiAssistant } from './AiAssistant';


const meta: Meta<typeof AiAssistant> = {
  title: 'Components/AiAssistant',
  component: AiAssistant,
  parameters: {
    layout: 'fullscreen', 
  },
  decorators: [
    (Story) => (
      <div className="min-h-[600px] bg-gray-200 dark:bg-brand-darkBg relative">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AiAssistant>;

export const Default: Story = {
  decorators: [
    (Story) => {
      sessionStorage.removeItem('ai_chat_history');
      return <Story />;
    },
  ],
};

export const WithHistory: Story = {
  decorators: [
    (Story) => {
      sessionStorage.setItem(
        'ai_chat_history',
        JSON.stringify([
          { role: 'user', content: 'What events are happening tomorrow?' },
          { role: 'assistant', content: 'Tomorrow there is an **Intro to React Architecture** event at 18:00. Would you like me to register you?' },
          { role: 'user', content: 'Yes, please!' }
        ])
      );
      return <Story />;
    },
  ],
};