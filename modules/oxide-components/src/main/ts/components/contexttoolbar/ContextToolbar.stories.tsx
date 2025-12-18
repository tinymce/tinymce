import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useRef, useState } from 'react';
import { fn } from 'storybook/test';

import { Button } from '../button/Button';
import { IconButton } from '../iconbutton/IconButton';

import * as ContextToolbar from './ContextToolbar';

/* eslint-disable max-len */
const resolvedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.7071 4.29289C15.3166 3.90237 14.6834 3.90237 14.2929 4.29289L6.58579 12L14.2929 19.7071C14.6834 20.0976 15.3166 20.0976 15.7071 19.7071C16.0976 19.3166 16.0976 18.6834 15.7071 18.2929L9.41421 12L15.7071 5.70711C16.0976 5.31658 16.0976 4.68342 15.7071 4.29289Z"/>
</svg>`;
/* eslint-enable max-len */

const meta = {
  title: 'components/ContextToolbar',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        /* eslint-disable max-len */
        component: `
A compound component for creating context toolbars that anchor to trigger elements.

## Usage

\`\`\`tsx
import * as ContextToolbar from 'oxide-components/ContextToolbar';

const MyComponent = () => {
  return (
    <div className='tox' style={{ position: 'relative' }}>
      <ContextToolbar.Root persistent={false}>
        <ContextToolbar.Trigger>
          <div style={{ backgroundColor: 'red', padding: '10px' }}>
            Click me!
          </div>
        </ContextToolbar.Trigger>
        <ContextToolbar.Toolbar>
          <ContextToolbar.Group>
            <Button>Accept</Button>
            <Button>Reject</Button>
          </ContextToolbar.Group>
        </ContextToolbar.Toolbar>
      </ContextToolbar.Root>
    </div>
  );
};
\`\`\`

## Components

### Root
The provider component that manages toolbar state.

**Props:**
- \`persistent\`: (optional, default: \`false\`). If true, the toolbar stays open when clicking outside of it.
- \`anchorRef\`: (optional). A ref to an external element to anchor the toolbar to. When provided, the toolbar positions relative to this element instead of the Trigger component. The toolbar auto-opens on mount if no Trigger component is present.

**Important:** 
- Use either \`Trigger\` component OR \`anchorRef\` (not both). 
- With \`anchorRef\` and no Trigger, the toolbar auto-opens on mount.
- Visibility is controlled by conditional rendering - mount/unmount the component based on your state (e.g., when an annotation is selected).

### Trigger
Wraps the element that opens the toolbar when clicked.

### Toolbar
Contains the toolbar content and groups. Uses the Popover API (popover='manual') for layering and positioning, with manual control over dismissal behavior.

### Group
Groups related buttons together for keyboard navigation. Buttons within a group are navigated with arrow keys, while Tab moves between groups.

## Behaviour
- Click trigger to open the toolbar
- Press **Escape** to close the toolbar (unless \`persistent=true\`)
- Press **Tab** to navigate to the first button in the next group
- Press **Shift+Tab** to navigate to the first button in the previous group
- Press **Arrow keys** to navigate between buttons within the current group
- Press **Enter** to execute the focused button
- Click outside to close the toolbar (unless \`persistent=true\`)
- Toolbar automatically receives focus when opened

## Accessibility
- **Keyboard Navigation**: 
  - \`Tab\` / \`Shift+Tab\`: Navigate between toolbar groups (cyclic)
  - \`Arrow Left\` / \`Arrow Up\`: Navigate to previous button in group
  - \`Arrow Right\` / \`Arrow Down\`: Navigate to next button in group
  - \`Enter\`: Execute focused button
  - \`Escape\`: Close the toolbar (unless \`persistent=true\`)
- **Focus Management**: Toolbar automatically receives focus when opened, with the first button in the first group focused
- **Click Outside**: Click outside the toolbar to dismiss it (unless \`persistent=true\`). The component handles click-outside detection.
- **Persistent Mode**: Use \`persistent=true\` for toolbars that require explicit dismissal (e.g. forms, critical actions). Disables both Escape key and click-outside dismissal.
- **ARIA**: Toolbar uses \`role="toolbar"\` and groups use \`role="group"\` for proper accessibility semantics
- **Toolbar Groups**: Matches TinyMCE core context toolbar behavior for consistency

## Positioning Anchoring Support

- ✅ **Chrome 125+**
- ✅ **Edge 125+**
- ✅ **Safari 18+**
- ❌ **Firefox** (not yet supported)

## Default Behavior

By default, the ContextToolbar anchors to the bottom left of the trigger element. It can position above/below or left/center/right based on the trigger element's inline positioning styles. The position-try-fallbacks CSS property automatically flips the toolbar when it would overflow the viewport.

## Key Features

- **Native CSS positioning** using \`anchor()\` function
- **Auto-detection** of anchor placement (top/bottom, left/center/right)
- **Automatic viewport overflow handling** with \`position-try-fallbacks\`
- **Dynamic gap** controlled by CSS variable \`--context-toolbar-gap\`
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
        story: 'Basic context toolbar using **CSS anchor positioning**. Click the trigger to open the toolbar. The toolbar will close when clicking outside (unless `persistent={true}`).',
      },
    },
  },
  render: () => {
    return (
      <div className='tox' style={{ position: 'relative' }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{ backgroundColor: 'red', padding: '10px' }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button onClick={fn()}>Accept</Button>
              <Button onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
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
    return (
      <div className='tox' style={{ position: 'relative' }}>
        <ContextToolbar.Root persistent={true}>
          <ContextToolbar.Trigger>
            <div style={{ backgroundColor: 'blue', padding: '10px' }}>
              Click me (Persistent)!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button onClick={fn()}>Accept</Button>
              <Button onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>
    );
  }
};

export const WithIconButtons: Story = {
  render: () => {
    return (
      <div className='tox' style={{ position: 'relative' }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{ backgroundColor: 'lightblue', padding: '10px' }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <IconButton variant='primary' icon='checkmark' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
              <IconButton variant='secondary' icon='cross' onClick={fn()} resolver={Fun.constant(resolvedIcon)} />
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>
    );
  }
};

export const ManyButtons: Story = {
  render: () => {
    return (
      <div className='tox' style={{ position: 'relative' }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{ backgroundColor: 'lightgreen', padding: '10px' }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Accept</Button>
              <Button variant='secondary' onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button variant='outlined' onClick={fn()}>Edit</Button>
              <Button variant='naked' onClick={fn()}>Comment</Button>
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Share</Button>
              <Button variant='secondary' onClick={fn()}>More</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
      </div>
    );
  }
};

export const MixedContent: Story = {
  render: () => {
    return (
      <div className='tox' style={{ position: 'relative' }}>
        <ContextToolbar.Root persistent={false}>
          <ContextToolbar.Trigger>
            <div style={{ backgroundColor: 'lightyellow', padding: '10px' }}>
              Click me!
            </div>
          </ContextToolbar.Trigger>
          <ContextToolbar.Toolbar>
            <ContextToolbar.Group>
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
            </ContextToolbar.Group>
            <ContextToolbar.Group>
              <Button variant='primary' onClick={fn()}>Accept</Button>
              <Button variant='secondary' onClick={fn()}>Reject</Button>
            </ContextToolbar.Group>
          </ContextToolbar.Toolbar>
        </ContextToolbar.Root>
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
      <div className='tox context-toolbar-anchors' style={{ width: '520px' }}>
        <div
          className='tox'
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
            <ContextToolbar.Root key={pos.id} persistent={false}>
              <ContextToolbar.Trigger>
                <div style={{ position: 'absolute', display: 'inline-flex', ...pos.style }}>
                  <Button>{pos.label}</Button>
                </div>
              </ContextToolbar.Trigger>
              <ContextToolbar.Toolbar>
                <ContextToolbar.Group>
                  <Button onClick={fn()}>Accept</Button>
                  <Button onClick={fn()}>Reject</Button>
                </ContextToolbar.Group>
              </ContextToolbar.Toolbar>
            </ContextToolbar.Root>
          ))}
        </div>
      </div>
    );
  }
};

export const WithAnchorRef: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using `anchorRef` without a Trigger component. The toolbar auto-opens on mount. Visibility is controlled externally via conditional rendering. This pattern is useful when conditionally rendering the toolbar based on state (e.g., when an annotation is selected).',
      },
    },
  },
  render: () => {
    const anchorRef = useRef<HTMLDivElement>(null);
    const [ showToolbar, setShowToolbar ] = useState(true);

    return (
      <div className='tox' style={{ position: 'relative' }}>
        <div
          ref={anchorRef}
          style={{
            backgroundColor: 'lightcoral',
            padding: '10px',
            cursor: 'pointer',
            display: 'inline-block'
          }}
        >
          Anchor element
        </div>

        <button onClick={() => setShowToolbar(!showToolbar)} style={{ marginLeft: '10px' }}>
          {showToolbar ? 'Hide' : 'Show'} Toolbar
        </button>

        {showToolbar && (
          <ContextToolbar.Root
            anchorRef={anchorRef}
            persistent={true}
          >
            <ContextToolbar.Toolbar>
              <ContextToolbar.Group>
                <Button>Accept</Button>
                <Button>Reject</Button>
              </ContextToolbar.Group>
            </ContextToolbar.Toolbar>
          </ContextToolbar.Root>
        )}
      </div>
    );
  }
};

