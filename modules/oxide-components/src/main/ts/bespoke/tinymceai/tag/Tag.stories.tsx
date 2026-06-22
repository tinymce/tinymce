import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UniverseProvider, type UniverseResources } from 'oxide-components/main';

import { Tag } from './Tag';

const meta = {
  title: 'bespoke/tinymceai/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

const resources: UniverseResources = {
  getIcon: Fun.constant(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
    <path fill="#222F3E" fill-rule="evenodd" d="M11.723 5.62 9.356 8l2.367 2.38a.95.95 0 0 1-1.343 1.343L8 9.356l-2.38 2.367a.95.95 0 0 1-1.343-1.343L6.644 8 4.277 5.62A.95.95 0 0 1 5.62 4.277L8 6.644l2.38-2.367a.95.95 0 0 1 1.343 1.343Z"/>
  </svg>
`),
};

export const ClosableTag: Story = {
  args: {
    closeable: true,
    link: false,
    label: 'Value',
    onClose: Fun.noop
  },
  render: (args) => (
    <UniverseProvider resources={resources}>
      <Tag {...args} />
    </UniverseProvider>
  )
};

export const FocusedClosableTag: Story = {
  args: {
    closeable: true,
    link: false,
    label: 'Value',
    onClose: Fun.noop
  },
  render: (args) => {
    return (
      <UniverseProvider resources={resources}>
        <Tag ref={(el) => el?.focus()} {...args} />
      </UniverseProvider>
    );
  }
};
