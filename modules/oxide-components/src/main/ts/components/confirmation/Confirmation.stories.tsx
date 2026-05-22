import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { useState } from 'react';

import { UniverseProvider } from '../../main';

import { Confirmation, type ConfirmationProps } from './Confirmation';
import { useConfirmation } from './internals/ConfirmationHook';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  close: allIcons.close
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const render = (args: ConfirmationProps): JSX.Element => {
  const [ container, setContainer ] = useState<HTMLDivElement | null>(null);
  const confirmationHook = useConfirmation(container);

  return <div style={{ width: '480px' }}>
    <div ref={setContainer}></div>
    <button style={{ cursor: 'pointer' }} onClick={() =>
      confirmationHook(args.text, args.onConfirm)
    }>show</button>
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
    }),
    onCancel: () => Promise.resolve()
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
    }),
    onCancel: () => Promise.resolve()
  }
};
