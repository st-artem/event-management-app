import type { Meta, StoryObj } from '@storybook/react';
import { TagChip } from './TagChip';


const meta: Meta<typeof TagChip> = {
  title: 'UI/TagChip',
  component: TagChip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagChip>;

export const Default: Story = {
  args: { name: 'tech' },
};

export const ColorPalette = {
  render: () => (
    <div className="flex flex-wrap gap-2 max-w-sm">
      <TagChip name="React" />
      <TagChip name="TypeScript" />
      <TagChip name="NodeJS" />
      <TagChip name="Design" />
      <TagChip name="Backend" />
      <TagChip name="Frontend" />
      <TagChip name="Database" />
      <TagChip name="DevOps" />
    </div>
  ),
};