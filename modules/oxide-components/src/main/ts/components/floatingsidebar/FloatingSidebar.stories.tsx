import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FloatingSidebar } from './FloatingSidebar';

const meta = {
  title: 'components/FloatingSidebar',
  component: FloatingSidebar,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'skip-visual-testing' ],
} satisfies Meta<typeof FloatingSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Example: Story = {
  args: {
    isOpen: true,
    onClose: Fun.noop,
    title: 'This is a title'
  },
  render: (args) => {
    return <FloatingSidebar isOpen title={args.title} onClose={args.onClose}/>;
  }
};
