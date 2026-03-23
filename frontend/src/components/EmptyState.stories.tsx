import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './EmptyState';
import { CalendarX2, Search } from 'lucide-react';


const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoSearchResults: Story = {
  args: {
    icon: <Search className="w-12 h-12" />,
    title: 'Нічого не знайдено',
    description: 'Спробуйте змінити параметри пошуку або перевірте правильність написання.',
  },
};

export const NoEvents: Story = {
  args: {
    icon: <CalendarX2 className="w-12 h-12" />,
    title: 'У вас немає івентів',
    description: 'Створіть свій перший івент, щоб залучити людей до вашої спільноти.',
    action: (
      <button className="px-6 py-2 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-all">
        Створити івент
      </button>
    ),
  },
};

export const Minimal: Story = {
  args: {
    title: 'Тут поки порожньо',
  },
};