import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button, type ButtonProps } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: ButtonProps): JSX.Element => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    gap: '8px'
  }}>
    <Button {...args} />
    <Button {...args} id='hover'>Hover</Button>
    <Button {...args} id='active'>Active</Button>
    <Button {...args} id='focus'>Focused</Button>
    <Button {...args} disabled>Disabled</Button>
  </div>
);

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    children: 'Primary',
  },
  parameters: {
    pseudo: {
      hover: [ '#hover' ],
      active: [ '#active' ],
      focus: [ '#focus' ],
    }
  },
  render,
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary'
  },
  parameters: {
    pseudo: {
      hover: [ '#hover' ],
      active: [ '#active' ],
      focus: [ '#focus' ],
    }
  },
  render,
};

export const Outlined: Story = {
  args: {
    children: 'Outlined',
    variant: 'outlined'
  },
  parameters: {
    pseudo: {
      hover: [ '#hover' ],
      active: [ '#active' ],
      focus: [ '#focus' ],
    }
  },
  render,
};

export const Naked: Story = {
  args: {
    children: 'Naked',
    variant: 'naked'
  },
  parameters: {
    pseudo: {
      hover: [ '#hover' ],
      active: [ '#active' ],
      focus: [ '#focus' ],
    }
  },
  render,
};
