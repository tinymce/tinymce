import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import * as SegmentedControl from './SegmentedControl';

const meta = {
  title: 'components/SegmentedControl',
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs' ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftActive: Story = {
  render: () => {
    const [ value, setValue ] = useState('diff');

    return (
      <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );
  }
};

export const RightActive: Story = {
  render: () => {
    const [ value, setValue ] = useState('preview');

    return (
      <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );
  }
};

export const ShortLabels: Story = {
  render: () => {
    const [ value, setValue ] = useState('off');

    return (
      <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="off">Off</SegmentedControl.Option>
        <SegmentedControl.Option value="on">On</SegmentedControl.Option>
      </SegmentedControl.Root>
    );
  }
};

export const LongLabels: Story = {
  render: () => {
    const [ value, setValue ] = useState('show');

    return (
      <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="show">Show changes</SegmentedControl.Option>
        <SegmentedControl.Option value="hide">Hide changes</SegmentedControl.Option>
      </SegmentedControl.Root>
    );
  }
};

export const Disabled: Story = {
  render: () => {
    const [ value, setValue ] = useState('diff');

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <SegmentedControl.Root value={value} onChange={setValue} disabled>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value="preview" onChange={setValue} disabled>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
      </div>
    );
  }
};

export const Interactive: Story = {
  render: () => {
    const [ value, setValue ] = useState('left');

    return (
      <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="left">Left</SegmentedControl.Option>
        <SegmentedControl.Option value="right">Right</SegmentedControl.Option>
      </SegmentedControl.Root>
    );
  }
};

export const ThreeOptions: Story = {
  render: () => {
    const [ value, setValue ] = useState('view');

    return (
      <SegmentedControl.Root value={value} onChange={setValue}>
        <SegmentedControl.Option value="view">View</SegmentedControl.Option>
        <SegmentedControl.Option value="edit">Edit</SegmentedControl.Option>
        <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
      </SegmentedControl.Root>
    );
  }
};

export const MultipleControls: Story = {
  render: () => {
    const [ state1, setState1 ] = useState('diff');
    const [ state2, setState2 ] = useState('edit');
    const [ state3, setState3 ] = useState('light');

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <SegmentedControl.Root value={state1} onChange={setState1}>
          <SegmentedControl.Option value="diff">Diff mode</SegmentedControl.Option>
          <SegmentedControl.Option value="preview">Preview</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value={state2} onChange={setState2}>
          <SegmentedControl.Option value="edit">Edit</SegmentedControl.Option>
          <SegmentedControl.Option value="view">View</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value={state3} onChange={setState3}>
          <SegmentedControl.Option value="light">Light</SegmentedControl.Option>
          <SegmentedControl.Option value="dark">Dark</SegmentedControl.Option>
        </SegmentedControl.Root>
        <SegmentedControl.Root value="disabled" onChange={Fun.noop} disabled>
          <SegmentedControl.Option value="disabled">Disabled</SegmentedControl.Option>
          <SegmentedControl.Option value="control">Control</SegmentedControl.Option>
        </SegmentedControl.Root>
      </div>
    );
  }
};
