import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button.component';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    type: {
      control: 'select',
      options: [ 'button', 'submit', 'reset' ]
    }
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    children: 'Button',
  },
};

export const ButtonWithCounter: Story = {
  render: () => {
    const [ count, setCount ] = useState(0);
    return (
      <Button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Clicked 0 times'));
    await expect(await canvas.findByText('Clicked 1 times')).toBeInTheDocument();
  },
};
