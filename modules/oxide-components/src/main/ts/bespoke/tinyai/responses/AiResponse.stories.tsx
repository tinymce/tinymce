import type { Meta, StoryObj } from '@storybook/react-vite';

import { AiResponse } from './AiResponse';

const meta = {
  title: 'bespoke/tinyai/AiResponse',
  component: AiResponse,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof AiResponse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleAiResponse: Story = {
  args: {
    response: 'Value'
  },
};
