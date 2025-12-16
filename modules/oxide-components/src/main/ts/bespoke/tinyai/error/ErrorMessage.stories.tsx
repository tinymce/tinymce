import type { Meta, StoryObj } from '@storybook/react-vite';

import ErrorMessage from './ErrorMessage';

type Story = StoryObj<typeof meta>;

const meta = {
  title: 'bespoke/tinyai/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof ErrorMessage>;

export default meta;

export const StandardErrorMessage: Story = {
  args: {
    message: 'Message'
  },
};