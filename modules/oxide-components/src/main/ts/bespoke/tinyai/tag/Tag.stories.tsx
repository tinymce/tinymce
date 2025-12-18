import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tag } from './Tag';

const meta = {
  title: 'bespoke/tinyai/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClosableTag: Story = {
  args: {
    closeable: true,
    label: 'Value',
    onClose: Fun.noop
  },
};
