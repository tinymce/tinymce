import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';

import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
  args: { onClick: fn() },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftActive: Story = {
  args: {
    checked: false,
    name: 'segmented-left-active',
    leftLabel: 'Diff mode',
    rightLabel: 'Preview',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [ args.checked ]);

    return (
      <SegmentedControl
        {...args}
        checked={checked}
        onClick={() => setChecked(!checked)}
      />
    );
  }
};

export const RightActive: Story = {
  args: {
    checked: true,
    name: 'segmented-right-active',
    leftLabel: 'Diff mode',
    rightLabel: 'Preview',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [ args.checked ]);

    return (
      <SegmentedControl
        {...args}
        checked={checked}
        onClick={() => setChecked(!checked)}
      />
    );
  }
};

export const ShortLabels: Story = {
  args: {
    checked: false,
    name: 'segmented-short',
    leftLabel: 'Off',
    rightLabel: 'On',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [ args.checked ]);

    return (
      <SegmentedControl
        {...args}
        checked={checked}
        onClick={() => setChecked(!checked)}
      />
    );
  }
};

export const LongLabels: Story = {
  args: {
    checked: false,
    name: 'segmented-long',
    leftLabel: 'Show changes',
    rightLabel: 'Hide changes',
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [ args.checked ]);

    return (
      <SegmentedControl
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
    name: 'segmented-disabled',
    leftLabel: 'Diff mode',
    rightLabel: 'Preview',
    disabled: true,
  },
  render: (args) => {
    const [ checked, setChecked ] = useState(args.checked);

    useEffect(() => {
      setChecked(args.checked);
    }, [ args.checked ]);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <SegmentedControl
          {...args}
          checked={checked}
          onClick={() => setChecked(!checked)}
        />
        <SegmentedControl
          {...args}
          checked={true}
          onClick={() => setChecked(!checked)}
        />
      </div>
    );
  }
};

export const Interactive: Story = {
  args: {
    name: 'segmented-interactive',
    leftLabel: 'Left',
    rightLabel: 'Right',
    checked: false,
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
        <SegmentedControl
          checked={state1}
          name="segmented-1"
          leftLabel="Diff mode"
          rightLabel="Preview"
          onClick={() => setState1(!state1)}
        />
        <SegmentedControl
          checked={state2}
          name="segmented-2"
          leftLabel="Edit"
          rightLabel="View"
          onClick={() => setState2(!state2)}
        />
        <SegmentedControl
          checked={state3}
          name="segmented-3"
          leftLabel="Light"
          rightLabel="Dark"
          onClick={() => setState3(!state3)}
        />
        <SegmentedControl
          checked={false}
          name="segmented-4"
          leftLabel="Disabled"
          rightLabel="Control"
          disabled
          onClick={() => Fun.noop()}
        />
      </div>
    );
  }
};
