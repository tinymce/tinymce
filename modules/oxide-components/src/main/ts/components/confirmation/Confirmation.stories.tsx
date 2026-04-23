import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { useState } from 'react';

import { UniverseProvider } from '../../main';

import { Confirmation, type ConfirmationProps } from './Confirmation';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  close: allIcons.close
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const render = (args: ConfirmationProps): JSX.Element => {
  const [ show, setShow ] = useState(false);
  return <div style={{ width: '480px' }}>
    <button style={{ cursor: 'pointer' }} onClick={() => setShow(!show)}>show</button>
    {show && <Confirmation {...args} onConfirm={() => args.onConfirm().finally(() => setShow(false))} />}
  </div>;
};

const meta: Meta<ConfirmationProps> = {
  title: 'components/Confirmation',
  component: Confirmation,
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
- \`closeAriaLabel\`: optional accessible label for the close button (defaults to \`Close\`)
        `
      }
    }
  },
  tags: [ 'autodocs' ],
  args: {
    title: 'confirmation title',
    text: 'do you want to confirm it?',
    buttonName: 'yes',
    onConfirm: () => new Promise((resolve) => {
      setTimeout(() => {
        // setShow(false);
        resolve();
      }, 1_000);
    })
  },
  render
};

export default meta;
type Story = StoryObj<ConfirmationProps>;

export const ConfirmationDialog: Story = {
  args: {
    title: 'confirmation title',
    text: 'do you want to confirm it?',
    buttonName: 'yes',
    onConfirm: () => new Promise((resolve) => {
      setTimeout(() => {
        return resolve();
      }, 2_000);
    })
  }
};

export const ConfirmationDialogWithError: Story = {
  args: {
    title: 'confirmation title',
    text: 'do you want to confirm it?',
    buttonName: 'yes',
    onConfirm: () => new Promise((_resolve, reject) => {
      setTimeout(() => {
        return reject();
      }, 2_000);
    })
  }
};
