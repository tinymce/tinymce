import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import * as Draggable from './Draggable';
import type { DraggableProps } from './internals/Types';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Draggable',
  component: Draggable.Root,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `A draggable container component that allows users to reposition elements by dragging them around the viewport.

## How it works

The Draggable component consists of two parts:

- **\`Draggable.Root\`** - The container element that will be moved. It handles positioning and bounds checking.
- **\`Draggable.Handle\`** - The area within the container that can be grabbed to initiate dragging. This typically represents a title bar or header.

During a drag operation, the component uses CSS transform \`translate3d\` and automatically constrains the element within the viewport bounds.
When dragging stops, the position is converted to absolute CSS positioning.

### Positioning

The component does not apply any \`position\` style by default, giving you the flexibility to choose the positioning strategy that fits your use case.
You must manually set the position using \`style={{ position: "absolute" }}\`, \`style={{ position: "fixed" }}\`, or use the Popover API.
The component will work with any positioning strategy as long as \`top\`, \`bottom\`, \`left\`, \`right\` CSS properties are supported.

### Viewport boundaries

By default, the entire draggable element must stay within the viewport (fully visible). You can customize this behavior using the \`allowedOverflow\` prop to allow portions of the element to move outside the viewport while maintaining minimum visibility.

### Window resize handling

To ensure the draggable element stays within the viewport after window resize, you must provide the \`declaredSize\` prop with the element's width and height.
This allows the component to use CSS \`min()\` to constrain the position and prevent the element from ending up outside the visible area.
If you don't provide \`declaredSize\`, the element may move outside the viewport on window resize.`
      }
    }
  },
  argTypes: {
    popover: {
      table: {
        disable: true
      }
    },
    origin: {
      description: `Determines which corner of the viewport the draggable element is positioned relative to, and which CSS positioning properties are used.

**Default:** \`'top-left'\`

**Options:**
- \`'top-left'\` - Uses \`top\` and \`left\` CSS properties, positioning relative to the top-left corner
- \`'top-right'\` - Uses \`top\` and \`right\` CSS properties, positioning relative to the top-right corner
- \`'bottom-left'\` - Uses \`bottom\` and \`left\` CSS properties, positioning relative to the bottom-left corner
- \`'bottom-right'\` - Uses \`bottom\` and \`right\` CSS properties, positioning relative to the bottom-right corner

The origin affects how the position is calculated and which edges of the viewport are used as reference points. For example, with \`origin: 'top-right'\`, the element's position is measured from the top and right edges of the viewport.`,
      control: {
        type: 'radio'
      },
      options: [ 'top-left', 'top-right', 'bottom-left', 'bottom-right' ],
    },
    initialPosition: {
      description: `The initial position of the draggable element using \`x\` and \`y\` coordinates. Both properties accept any valid CSS value. The \`x\` and \`y\` values map to CSS positioning properties based on the \`origin\` setting.

**Examples:**
- \`origin: 'top-left'\` with \`initialPosition: { x: '50px', y: '100px' }\` → sets \`left: 50px\` and \`top: 100px\`
- \`origin: 'bottom-right'\` with \`initialPosition: { x: '50px', y: '100px' }\` → sets \`right: 50px\` and \`bottom: 100px\``,
    },
    allowedOverflow: {
      description: `Controls how much of the draggable element is allowed to overflow outside the viewport. Values are decimals between 0 and 1.

**Default behavior:** When not provided, the entire element must stay within the viewport (equivalent to \`{ horizontal: 0, vertical: 0 }\` - no overflow allowed).

**Properties:**
- \`horizontal\` (optional): Fraction of element width that can overflow outside viewport (0-1). Defaults to 0 (no overflow) if omitted.
- \`vertical\` (optional): Fraction of element height that can overflow outside viewport (0-1). Defaults to 0 (no overflow) if omitted.

**Examples:**
- \`{ horizontal: 0.9, vertical: 0.9 }\` - Up to 90% of each dimension can overflow (10% must remain visible)
- \`{ horizontal: 0.8 }\` - Up to 80% of width can overflow (20% must be visible), full height must stay on screen (default)
- \`{ vertical: 0.5 }\` - Up to 50% of height can overflow, full width must stay on screen (default)`
    },
    declaredSize: {
      description: `Optional declared size of the draggable element. This is used to ensure the Draggable element will not end up out of window on window resize.
You can omit setting this property if you don't care about window resize.
If you do care about it, but don't know the exact size of the element you'll have to calculate it using javascript.`
    },
    onDragStart: {
      description: 'Optional callback function that is called when dragging begins.'
    },
    onDragEnd: {
      description: 'Optional callback function that is called when dragging ends.'
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
  // Use `fn` to spy on the callback args, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onDragStart: fn(), onDragEnd: fn() },
} satisfies Meta<typeof Draggable.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: DraggableProps): JSX.Element => (
  <Draggable.Root {...args} style={{ position: 'fixed' }}>
    <div style={{ width: 250, height: 250, backgroundColor: '#fef68a' }}>
      <Draggable.Handle>
        <div style={{ width: '100%', height: 50, backgroundColor: '#e8d96f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Drag me</div>
      </Draggable.Handle>
    </div>
  </Draggable.Root>
);

export const Example: Story = {
  args: {
    origin: 'top-left',
    initialPosition: { x: '50px', y: '50px' },
    allowedOverflow: { horizontal: 0.6, vertical: 0 },
    declaredSize: { width: '250px', height: '250px' }
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render,
};
