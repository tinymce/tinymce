import type { Meta, StoryObj } from '@storybook/react-vite';

import { StreamingAiResponse } from './StreamingAiResponse';

const meta = {
  title: 'bespoke/tinyai/StreamingAiResponse',
  component: StreamingAiResponse,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof StreamingAiResponse>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const SimpleStreamingAiResponse: Story = {
  args: {
    response: 'Value'
  },
};
