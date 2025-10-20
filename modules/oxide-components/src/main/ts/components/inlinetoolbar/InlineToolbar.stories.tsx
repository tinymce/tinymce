import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { fn } from 'storybook/test';

import { Button } from '../button/Button';
import { IconButton } from '../iconbutton/IconButton';

import * as InlineToolbar from './InlineToolbar';

/* eslint-disable max-len */
const resolvedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`;
/* eslint-enable max-len */

const meta = {
  title: 'components/InlineToolbar',
  parameters: {
    layout: 'centered',
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// TODO: Add more stories (TINY-13065)

export const Basic: Story = {
  render: () => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar.Root sinkRef={sinkRef} persistent={false}>
          <InlineToolbar.Trigger>
            <div style={{ backgroundColor: 'red', padding: '10px' }}>
              Click me!
            </div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <Button onClick={fn()}>Accept</Button>
            <Button onClick={fn()}>Reject</Button>
          </InlineToolbar.Toolbar>
        </InlineToolbar.Root>
      </div>
    );
  }
};

export const Persistent: Story = {
  render: () => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar.Root sinkRef={sinkRef} persistent={true}>
          <InlineToolbar.Trigger>
            <div style={{ backgroundColor: 'blue', padding: '10px' }}>
              Click me (Persistent)!
            </div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <Button onClick={fn()}>Accept</Button>
            <Button onClick={fn()}>Reject</Button>
          </InlineToolbar.Toolbar>
        </InlineToolbar.Root>
      </div>
    );
  }
};

export const WithIconButtons: Story = {
  render: () => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar.Root sinkRef={sinkRef} persistent={false}>
          <InlineToolbar.Trigger>
            <div style={{ backgroundColor: 'lightblue', padding: '10px' }}>
              Click me!
            </div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <IconButton variant='primary' icon="checkmark" onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
            <IconButton variant='secondary' icon="cross" onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
          </InlineToolbar.Toolbar>
        </InlineToolbar.Root>
      </div>
    );
  }
};

export const ManyButtons: Story = {
  render: () => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar.Root sinkRef={sinkRef} persistent={false}>
          <InlineToolbar.Trigger>
            <div style={{ backgroundColor: 'lightgreen', padding: '10px' }}>
              Click me!
            </div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <Button variant='primary' onClick={fn()}>Accept</Button>
            <Button variant='secondary' onClick={fn()}>Reject</Button>
            <Button variant='outlined' onClick={fn()}>Edit</Button>
            <Button variant='naked' onClick={fn()}>Comment</Button>
            <Button variant='primary' onClick={fn()}>Share</Button>
            <Button variant='secondary' onClick={fn()}>More</Button>
          </InlineToolbar.Toolbar>
        </InlineToolbar.Root>
      </div>
    );
  }
};

export const MixedContent: Story = {
  render: () => {
    const sinkRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={sinkRef} className="tox" style={{ position: 'relative' }}>
        <InlineToolbar.Root sinkRef={sinkRef} persistent={false}>
          <InlineToolbar.Trigger>
            <div style={{ backgroundColor: 'lightyellow', padding: '10px' }}>
              Click me!
            </div>
          </InlineToolbar.Trigger>
          <InlineToolbar.Toolbar>
            <IconButton icon='arrow-up' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
            <span style={{
              padding: '8px',
              fontSize: '12px',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              1/3
            </span>
            <IconButton icon='arrow-down' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
            <Button variant='primary' onClick={fn()}>Accept</Button>
            <Button variant='secondary' onClick={fn()}>Reject</Button>
          </InlineToolbar.Toolbar>
        </InlineToolbar.Root>
      </div>
    );
  }
};