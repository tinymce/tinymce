import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { AutoResizingTextarea } from './AutoResizingTextarea';

const meta = {
  title: 'components/AutoResizingTextarea',
  component: AutoResizingTextarea,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof AutoResizingTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Example: Story = {
  args: {
    value: 'initial value',
  },
  render: (args) => {
    const [ value, setValue ] = useState(args.value);
    return <AutoResizingTextarea {...args} value={value} onChange={setValue} />;
  }
};

export const StartsWith2Rows: Story = {
  args: {
    value: 'initial value',
  },
  render: (args) => {
    const [ value, setValue ] = useState(args.value);
    return <AutoResizingTextarea value={value} onChange={setValue} minHeight={{
      unit: 'rows',
      value: 2
    }} />;
  }
};
