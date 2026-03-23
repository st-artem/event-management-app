import type { Meta, StoryObj } from '@storybook/react';
import Loader from './Loader';


const meta: Meta<typeof Loader> = {
  title: 'UI/Loader',
  component: Loader,
  parameters: {
    layout: 'fullscreen', 
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const FullScreen: Story = {
  args: {
    text: 'Завантаження системи...',
    fullScreen: true,
  },
};

export const Inline: Story = {
  args: {
    text: 'Оновлюємо список...',
    fullScreen: false,
  },
};

export const IconOnly: Story = {
  args: {
    text: '',
    fullScreen: false,
  },
};