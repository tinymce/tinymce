import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { ToggleSwitch } from './ToggleSwitch';

const meta = {
  title: 'components/ToggleSwitch',
  component: ToggleSwitch,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
  args: { onClick: fn() },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Checked: Story = {
  args: {
    checked: true,
    name: 'toggle-checked',
    children: 'Toggle switch',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);
    return (
      <ToggleSwitch
        {...args}
        checked={checked}
        onClick={() => setChecked(!checked)}
      >
        {args.children}
      </ToggleSwitch>
    );
  }
};

export const Unchecked: Story = {
  args: {
    checked: false,
    name: 'toggle-unchecked',
    children: 'Toggle switch',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);
    return (
      <ToggleSwitch
        {...args}
        checked={checked}
        onClick={() => setChecked(!checked)}
      >
        {args.children}
      </ToggleSwitch>
    );
  }
};

export const WithoutLabel: Story = {
  args: {
    checked: false,
    name: 'toggle-without-label',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);
    return (
      <ToggleSwitch
        {...args}
        checked={checked}
        onClick={() => setChecked(!checked)}
      />
    );
  }
};

export const Disabled: Story = {
  args: {
    checked: false,
    name: 'toggle-disabled',
    disabled: true,
    children: 'Toggle switch',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <ToggleSwitch
          {...args}
          checked={checked}
          onClick={() => setChecked(!checked)}
        >
          Disabled
        </ToggleSwitch>
        <ToggleSwitch
          {...args}
          checked={true}
          onClick={() => setChecked(!checked)}
        >
          Disabled checked
        </ToggleSwitch>
      </div>
    );
  }
};

export const Interactive: Story = {
  args: {
    name: 'toggle-interactive',
  },
  render: () => {
    const [ state1, setState1 ] = useState(false);
    const [ state2, setState2 ] = useState(true);
    const [ state3, setState3 ] = useState(false);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <ToggleSwitch
          checked={state1}
          name="toggle-1"
          onClick={() => setState1(!state1)}
        >
          Toggle 1
        </ToggleSwitch>
        <ToggleSwitch
          checked={state2}
          name="toggle-2"
          onClick={() => setState2(!state2)}
        >
          Toggle 2
        </ToggleSwitch>
        <ToggleSwitch
          checked={state3}
          name="toggle-3"
          onClick={() => setState3(!state3)}
        >
          Toggle 3
        </ToggleSwitch>
        <ToggleSwitch
          checked={false}
          name="toggle-4"
          disabled
          onClick={() => Fun.noop()}
        >
          Toggle 4 (disabled)
        </ToggleSwitch>
      </div>
    );
  }
};
