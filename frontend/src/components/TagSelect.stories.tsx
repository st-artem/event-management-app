import type { Meta, StoryObj } from '@storybook/react';
import { TagSelect } from './TagSelect';
import { useState } from 'react';
import { type TagOption } from '../types';


const meta: Meta<typeof TagSelect> = {
  title: 'Components/TagSelect',
  component: TagSelect,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto min-h-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagSelect>;

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState<TagOption[]>([]);
    
    return (
      <TagSelect 
        {...args} 
        value={value} 
        onChange={(newValue) => setValue(newValue)} 
      />
    );
  },
  args: {
    maxTags: 5,
    placeholder: "Виберіть або створіть тег...",
    options: [
      { value: 'react', label: 'React' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'node', label: 'Node.js' },
      { value: 'docker', label: 'Docker' },
    ],
  },
};

export const MaxTagsReached: Story = {
  args: {
    ...Interactive.args,
    value: [
      { value: '1', label: 'Tag 1' },
      { value: '2', label: 'Tag 2' },
      { value: '3', label: 'Tag 3' },
    ],
    maxTags: 3,
  },
};