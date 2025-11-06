import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Draggable from './Draggable';
import type { DraggableProps } from './internals/types';

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
The component will work with any positioning strategy as long as \`top\` and \`left\` CSS properties are supported.

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
    initialPosition: {
      description: 'The initial position of the draggable element. `top` and `left` can be provided as any valid CSS.',
    },
    declaredSize: {
      description: `Optional declared size of the draggable element. This is used to ensure the Draggable element will not end up out of window on window resize.
You can omit setting this property if you don't care about window resize.
If you do care about it, but don't know the exact size of the element you'll have to calculate it using javascript.`
    }
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof Draggable.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: DraggableProps): JSX.Element => (
  <Draggable.Root {...args} style={{ position: 'absolute' }}>
    <div style={{ width: 250, height: 250, backgroundColor: '#fef68a' }}>
      <Draggable.Handle>
        <div style={{ width: '100%', height: 50, backgroundColor: '#e8d96f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Drag me</div>
      </Draggable.Handle>
    </div>
  </Draggable.Root>
);

export const Example: Story = {
  args: {
    initialPosition: { top: '50px', left: '50px' },
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
