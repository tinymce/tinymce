import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Textarea } from './Textarea.component';

const meta = {
  title: 'components/Textarea',
  component: Textarea,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Example: Story = {
  render: () => {
    const [ value, setValue ] = useState('initial value');
    const onInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      setValue(event.currentTarget.value);
    };
    return <Textarea value={value} onInput={onInput} />;
  }
};

export const StartsWith2Rows: Story = {
  render: () => {
    const [ value, setValue ] = useState('initial value');
    const onInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      setValue(event.currentTarget.value);
    };
    return <Textarea value={value} onInput={onInput} minHeight={{
      unit: 'rows',
      value: 2
    }} />;
  }
};
