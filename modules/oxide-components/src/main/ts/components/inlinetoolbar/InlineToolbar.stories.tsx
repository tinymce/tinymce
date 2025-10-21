import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useRef } from 'react';
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
    docs: {
      description: {
        component: `
A compound component for creating inline toolbars that anchor to trigger elements.

## Usage

\`\`\`tsx
import * as InlineToolbar from 'oxide-components/InlineToolbar';

const MyComponent = () => {
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
          <Button>Accept</Button>
          <Button>Reject</Button>
        </InlineToolbar.Toolbar>
      </InlineToolbar.Root>
    </div>
  );
};
\`\`\`

## Components

### Root
The provider component that manages toolbar state.

**Props:**
- \`sinkRef\`: RefObject to the container where the toolbar renders (must have \`position: relative\`).
- \`persistent\`: (optional, default: \`false\`). If true, the toolbar stays open when clicking outside of it.

### Trigger
Wraps the element that opens the toolbar when clicked.

### Toolbar
Contains the toolbar content (buttons, text, etc.). Renders as a portal into the sink element.

## Behaviour
- Click trigger to open the toolbar
- Press Escape to close the toolbar
- Click outside to close the toolbar (unless \`persistent=true\`)
- Toolbar automatically receives focus when opened

## Accessibility
- **Keyboard Navigation**: Press \`Escape\` to close the toolbar.
- **Focus Management**: Toolbar automatically receives focus when opened for immediate keyboard access
- **Click Outside**: Click outside the toolbar to dismiss it (unless \`persistent=true\`)
- **Persistent Mode**: Use \`persistent=true\` for toolbars that require explicit dismissal (e.g. forms, critical actions)
- **ARIA**: The toolbar container is focusable (\`tabIndex={-1}\`) to support keyboard navigation

## Positioning Anchoring Support

- ✅ **Chrome 125+**
- ✅ **Edge 125+**
- ✅ **Safari 26+**
- ❌ **Firefox** (not yet supported)

## Default Behavior

By default, the InlineToolbar anchor itself to the **bottom left** of the trigger element (left alignment). It automatically detects whether to position above or below, and left/center/right based on the trigger's position in the viewport.

## Key Features

- **Native CSS positioning** using \`anchor()\` function
- **Auto-detection** of anchor placement (top/bottom, left/center/right)
- **Automatic viewport overflow handling** with \`position-try-fallbacks\`
- **Dynamic gap** controlled by CSS variable \`--inline-toolbar-gap\`
- **Unique anchor names** per instance using \`Id.generate()\`

## How It Works

1. Generates unique anchor name for each toolbar instance
2. Sets \`anchor-name\` CSS property on trigger element
3. Links toolbar to anchor via \`position-anchor\` property
4. Calculates position using \`anchor()\` and \`anchor-size()\` CSS functions
5. Applies transform for center/bottom alignment
6. Enables automatic flipping when toolbar would overflow viewport

See the **Corners** story for a live demonstration of auto-flip behavior.
        `,
      },
    },
  },
  argTypes: {
    sinkRef: {
      description: 'RefObject to the container element where the toolbar will render. This element must have `position: relative` or `position: absolute` set.',
      table: {
        type: { summary: 'RefObject<HTMLDivElement>' },
      }
    },
    persistent: {
      description: 'When true, the toolbar will not close when clicking outside of it. Useful for toolbars that should stay open until explicitly closed.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
      control: 'boolean'
    }
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Basic inline toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`).',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: 'Toolbar with `persistent={true}` - does not close when clicking outside. Useful for toolbars that should remain open until explicitly closed.',
      },
    },
  },
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

export const Corners: Story = {
  parameters: {
    docs: {
      description: {
        story: `Demonstrates CSS anchor positioning with 9 trigger buttons placed at different positions.`,
      },
    },
  },
  render: () => {
    const sinkRef = useRef<HTMLDivElement>(null);

    const triggerPositions = useMemo(() => ([
      // Top row
      { id: 'top-left', label: 'Top Left', style: { top: '20px', left: '20px' }},
      { id: 'top-center', label: 'Top Center', style: { top: '20px', left: '50%', marginLeft: 'calc(-1 * (6ch + 24px) / 2)' }},
      { id: 'top-right', label: 'Top Right', style: { top: '20px', right: '20px' }},
      // Middle row
      { id: 'middle-left', label: 'Middle Left', style: { top: '50%', left: '20px', marginTop: 'calc(-1em / 2)' }},
      { id: 'center', label: 'Center', style: { top: '50%', left: '50%', marginTop: 'calc(-1em / 2)', marginLeft: 'calc(-1 * (4ch + 24px) / 2)' }},
      { id: 'middle-right', label: 'Middle Right', style: { top: '50%', right: '20px', marginTop: 'calc(-1em / 2)' }},
      // Bottom row
      { id: 'bottom-left', label: 'Bottom Left', style: { bottom: '20px', left: '20px' }},
      { id: 'bottom-center', label: 'Bottom Center', style: { bottom: '20px', left: '50%', marginLeft: 'calc(-1 * (9ch + 24px) / 2)' }},
      { id: 'bottom-right', label: 'Bottom Right', style: { bottom: '20px', right: '20px' }}
    ] as const), []);

    return (
      <div className="tox inline-toolbar-anchors" style={{ width: '520px' }}>
        <div
          ref={sinkRef}
          className="tox"
          style={{
            position: 'relative',
            height: '360px',
            border: '1px solid #c6cdd6',
            borderRadius: '16px',
            background: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {triggerPositions.map((pos) => (
            <InlineToolbar.Root key={pos.id} sinkRef={sinkRef} persistent={false}>
              <InlineToolbar.Trigger>
                <div style={{ position: 'absolute' as const, display: 'inline-flex', ...pos.style }}>
                  <Button>{pos.label}</Button>
                </div>
              </InlineToolbar.Trigger>
              <InlineToolbar.Toolbar>
                <Button onClick={fn()}>Accept</Button>
                <Button onClick={fn()}>Reject</Button>
              </InlineToolbar.Toolbar>
            </InlineToolbar.Root>
          ))}
        </div>
      </div>
    );
  }
};
