import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';


const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};

export const MobileView: Story = {
  render: () => (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-brand-darkBg py-10">
      <div className="w-[390px] h-[844px] border-[14px] border-gray-900 dark:border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl relative bg-white dark:bg-brand-darkCard">
        <iframe
          src="/iframe.html?id=components-navbar--default&viewMode=story"
          className="w-full h-full border-0"
          title="Mobile Navbar View"
        />
      </div>
    </div>
  ),
};