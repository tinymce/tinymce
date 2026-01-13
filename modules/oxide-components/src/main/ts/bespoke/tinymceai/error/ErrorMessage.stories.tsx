import { Fun, Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UniverseProvider } from 'oxide-components/main';

import ErrorMessage from './ErrorMessage';

const icons: Record<string, string> = {
  close: '<svg width="24" height="24"><path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path></svg>'
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const meta = {
  title: 'bespoke/tinymceai/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
  decorators: [
    (Story) => (
      <div className='tox-ai'>
        <UniverseProvider resources={mockUniverse}>
          <Story />
        </UniverseProvider>
      </div>
    )
  ],
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const StandardErrorMessage: Story = {
  args: {
    message: 'Message'
  },
};

export const RemoveableErrorMessage: Story = {
  args: {
    message: 'Message',
    removable: true,
    onRemove: Fun.noop
  },
};
