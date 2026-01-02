import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../../components/button/Button';

import { PreviewLoader } from './PreviewLoader';

const meta = {
  title: 'bespoke/tinymceai/PreviewLoader',
  component: PreviewLoader,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof PreviewLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const SimplePreviewLoader: Story = {
  args: { text: 'Generating response...' },
  render: (args) => <PreviewLoader {...args} />,
};

export const PlainPreviewLoader: Story = {
  args: { text: '' },
  render: (args) => <PreviewLoader {...args} />
};

export const PreviewLoaderWithButton: Story = {
  args: { text: 'Generating response... ' },
  render: (args) => (
    <PreviewLoader {...args}>
      <Button variant="secondary">Stop</Button>
    </PreviewLoader>
  ),
};
