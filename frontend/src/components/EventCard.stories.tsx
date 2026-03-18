import type { Meta, StoryObj } from '@storybook/react';
import EventCard from './EventCard';


const meta: Meta<typeof EventCard> = {
  title: 'Components/EventCard',
  component: EventCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onJoin: (id: number) => console.log('Join event:', id),
    onLeave: (id: number) => console.log('Leave event:', id),
    onClick: () => console.log('Card clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof EventCard>;
const mockUser = {
  id: 1,
  name: 'Artem',
  email: 'artem@example.com', 
};

const mockOrganizer = {
  id: 99,
  name: 'Senior Dev',
  email: 'senior@example.com', 
};

export const Default: Story = {
  args: {
    currentUserId: 1,
    event: {
      id: 101,
      title: 'Intro to React Architecture',
      description: 'Learn how to build scalable applications using modern React patterns and Clean Architecture.',
      dateTime: '2026-05-20T18:00:00Z',
      location: 'Kyiv, Ukraine / Online',
      capacity: 50,
      participants: [mockUser, { id: 2, name: 'Toma', email: 'toma@example.com' }],
      organizer: mockOrganizer,
      tags: [
        { id: '1', name: 'React' },
        { id: '2', name: 'Architecture' }
      ],
    },
  },
};

export const Joined: Story = {
  args: {
    ...Default.args,
    currentUserId: 1, 
  },
};

export const Organizer: Story = {
  args: {
    ...Default.args,
    currentUserId: 99,
  },
};

export const EventFull: Story = {
  args: {
    ...Default.args,
    currentUserId: 10,
    event: {
      ...Default.args!.event!,
      capacity: 2,
      participants: [
        { id: 1, name: 'User 1', email: 'u1@ex.com' },
        { id: 2, name: 'User 2', email: 'u2@ex.com' }
      ],
    },
  },
};