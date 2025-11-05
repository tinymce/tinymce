import type { Meta, StoryObj } from '@storybook/react-vite';

import { UserPromptBubble } from './UserPromptBubble';

const meta = {
  title: 'bespoke/tinyai/UserPromptBubble',
  component: UserPromptBubble,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof UserPromptBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleUserPromptBubble: Story = {
  args: {
    prompt: 'Value'
  },
};
