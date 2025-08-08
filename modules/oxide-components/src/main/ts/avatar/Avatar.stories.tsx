import type { Meta, StoryObj } from '@storybook/react-vite';

import userAvatar from './assets/briar-griffin.jpg';
import { Avatar } from './Avatar.component';

const meta = {
  title: 'Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
  argTypes: { },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserAvatar: Story = {
  args: {
    user: { id: 'briar-griffin', name: 'Briar Griffin', avatar: userAvatar }
  }
};

export const DefaultAvatar: Story = {
  args: {
    user: { id: 'celeste-henderson', name: 'Celeste Henderson' }
  }
};
