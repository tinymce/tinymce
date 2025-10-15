import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, Fragment } from 'react';
import { fn } from 'storybook/test';

import { Button } from '../button/Button';

import { InlineToolbar } from './InlineToolbar';

const meta = {
  title: 'components/InlineToolbar',
  component: InlineToolbar,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof InlineToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO: Add more stories (TINY-13065)

export const Basic: Story = {
  args: {
    children: (
      <Fragment>
        <InlineToolbar.Trigger>
          <div style={{ backgroundColor: 'red', padding: '10px' }}>
            Click me!
          </div>
        </InlineToolbar.Trigger>
        <InlineToolbar.Toolbar>
          <Button onClick={fn()}>Accept</Button>
          <Button onClick={fn()}>Reject</Button>
        </InlineToolbar.Toolbar>
      </Fragment>
    ),
    sinkRef: { current: null },
    persistent: false
  },
  render: (args) => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar {...args} sinkRef={sinkRef} />
      </div>
    );
  }
};

export const Persistent: Story = {
  args: {
    children: (
      <Fragment>
        <InlineToolbar.Trigger>
          <div style={{ backgroundColor: 'blue', padding: '10px' }}>
            Click me (Persistent)!
          </div>
        </InlineToolbar.Trigger>
        <InlineToolbar.Toolbar>
          <Button onClick={fn()}>Accept</Button>
          <Button onClick={fn()}>Reject</Button>
        </InlineToolbar.Toolbar>
      </Fragment>
    ),
    sinkRef: { current: null },
    persistent: true
  },
  render: (args) => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar {...args} sinkRef={sinkRef} />
      </div>
    );
  }
};