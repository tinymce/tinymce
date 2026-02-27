import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { fn } from 'storybook/test';

import { Button, UniverseProvider } from '../../main';

import { Alert, type AlertProps } from './Alert';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  close: allIcons.close
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const message = 'The change is not supported by the editor and can\'t be previewed or applied.';

const render = (args: AlertProps): JSX.Element => (
  <div style={{ width: '480px' }}>
    <Alert {...args} />
  </div>
);

const meta: Meta<AlertProps> = {
  title: 'components/Alert',
  component: Alert,
  decorators: [
    (Story: () => JSX.Element): JSX.Element => (
      <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>
    )
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Alert component displays warning/error feedback with optional action and remove controls.

## Props
- \`message\`: string content shown in the alert body
- \`severity\`: \`error\` | \`warning\`
- \`actions\`: optional slot for one or more action buttons/components
- \`removable\`: optional close affordance (requires \`onRemove\`)
        `
      }
    }
  },
  tags: [ 'autodocs' ],
  args: {
    message,
    severity: 'error'
  },
  render
};

export default meta;
type Story = StoryObj<AlertProps>;

export const Error: Story = {};

export const ErrorRemovable: Story = {
  args: {
    removable: true,
    onRemove: fn()
  }
};

export const ErrorWithAction: Story = {
  args: {
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
};

export const ErrorRemovableWithAction: Story = {
  args: {
    removable: true,
    onRemove: fn(),
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
};

export const ErrorWithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant='naked' onClick={fn()}>Action 1</Button>
        <Button variant='naked' onClick={fn()}>Action 2</Button>
      </>
    )
  }
};

export const ErrorRemovableWithActions: Story = {
  args: {
    removable: true,
    onRemove: fn(),
    actions: (
      <>
        <Button variant='naked' onClick={fn()}>Action 1</Button>
        <Button variant='naked' onClick={fn()}>Action 2</Button>
      </>
    )
  }
};

export const Warning: Story = {
  args: {
    severity: 'warning'
  }
};

export const WarningRemovable: Story = {
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn()
  }
};

export const WarningWithAction: Story = {
  args: {
    severity: 'warning',
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
};

export const WarningRemovableWithAction: Story = {
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn(),
    actions: <Button variant='naked' onClick={fn()}>Action</Button>
  }
};

export const WarningWithActions: Story = {
  args: {
    severity: 'warning',
    actions: (
      <>
        <Button variant='naked' onClick={fn()}>Retry</Button>
        <Button variant='naked' onClick={fn()}>Dismiss all</Button>
      </>
    )
  }
};

export const WarningRemovableWithActions: Story = {
  args: {
    severity: 'warning',
    removable: true,
    onRemove: fn(),
    actions: (
      <>
        <Button variant='naked' onClick={fn()}>Retry</Button>
        <Button variant='naked' onClick={fn()}>Dismiss all</Button>
      </>
    )
  }
};
