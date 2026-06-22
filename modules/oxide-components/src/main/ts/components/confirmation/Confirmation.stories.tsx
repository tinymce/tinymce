import { Obj } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getAll as getAllIcons } from '@tinymce/oxide-icons-default';
import { useRef } from 'react';

import { UniverseProvider } from '../../main';

import { ConfirmationHost, type ConfirmationHostHandle } from './internals/ConfirmationHost';

const allIcons = getAllIcons();
const icons: Record<string, string> = {
  close: allIcons.close
};

const mockUniverse = {
  getIcon: (name: string) =>
    Obj.get(icons, name).getOrDie('Failed to get icon')
};

const render = (args: { text: string; onConfirm: () => Promise<void> }): JSX.Element => {
  const hostRef = useRef<ConfirmationHostHandle>(null);

  return <div style={{ width: '480px' }}>
    <ConfirmationHost ref={hostRef} />
    <button style={{ cursor: 'pointer' }} onClick={() =>
      hostRef.current?.confirm({ text: args.text, onConfirm: args.onConfirm })
    }>show</button>
  </div>;
};

const meta: Meta<{ text: string; onConfirm: () => Promise<void> }> = {
  title: 'components/Confirmation',
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
    text: 'do you want to confirm it?',
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
type Story = StoryObj<{ text: string; onConfirm: () => Promise<void> }>;

export const ConfirmationDialog: Story = {
  args: {
    text: 'do you want to confirm it?',
    onConfirm: () => new Promise((resolve) => {
      setTimeout(() => {
        return resolve();
      }, 2_000);
    })
  }
};

export const ConfirmationDialogWithError: Story = {
  args: {
    text: 'do you want to confirm it?',
    onConfirm: () => new Promise((_resolve, reject) => {
      setTimeout(() => {
        return reject();
      }, 2_000);
    })
  }
};
