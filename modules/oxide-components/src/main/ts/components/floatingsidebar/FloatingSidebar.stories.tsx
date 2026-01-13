import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UniverseProvider } from 'oxide-components/contexts/UniverseContext/UniverseProvider';
import { fn } from 'storybook/test';

import { IconButton } from '../iconbutton/IconButton';

import * as FloatingSidebar from './FloatingSidebar';
import type { FloatingSidebarProps } from './FloatingSidebar';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/FloatingSidebar',
  component: FloatingSidebar.Root,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A draggable floating sidebar component, can be positioned anywhere on the screen.

## How it works

The FloatingSidebar is built on top of the Draggable component.
It consists of two parts:

- **\`FloatingSidebar.Root\`** - The container that manages the sidebar's position and visibility.
- **\`FloatingSidebar.Header\`** - A required header element that acts as the drag handle for moving the sidebar.

The sidebar can be opened or closed programmatically using the \`isOpen\` prop.
When dragged, the sidebar can be moved freely and may partially extend beyond the viewport edge while maintaining its position across window resizes.`
      }
    }
  },
  decorators: [
    (Story) => (
      <UniverseProvider resources={mockUniverse}>
        <Story />
      </UniverseProvider>
    )
  ],
  argTypes: {
    isOpen: {
      description: 'Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    origin: {
      description: `Determines which CSS coordinate system is used to position the sidebar. 
For example, \`top-left\` uses the \`top\` and \`left\` CSS properties, while \`bottom-right\` uses \`bottom\` and \`right\`.
The \`x\` and \`y\` values in \`initialPosition\` correspond to these CSS properties.`,
      control: {
        type: 'radio'
      },
      options: [ 'top-left', 'top-right', 'bottom-left', 'bottom-right' ],
    },
    initialPosition: {
      description: `Sets the initial position of the sidebar as an object with \`x\` and \`y\` coordinates.
These values can be specified in any CSS length unit (pixels, percentages, etc.).
The \`x\` and \`y\` values map to the CSS positioning properties determined
by the \`origin\` prop (e.g., with \`origin="top-left"\`, \`x\` maps to \`left\` and \`y\` maps to \`top\`)`,
    },
    onDragStart: {
      description: 'Optional callback function that is called when dragging begins.'
    },
    onDragEnd: {
      description: 'Optional callback function that is called when dragging ends.'
    },
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs' ],
  // Use `fn` to spy on the callback args, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onDragStart: fn(), onDragEnd: fn() },
} satisfies Meta<typeof FloatingSidebar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    isOpen: true,
    initialPosition: { x: '30px', y: '30px' },
    origin: 'top-right'
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 700
      }
    }
  },
  render: (args: FloatingSidebarProps): JSX.Element => (
    <FloatingSidebar.Root {...args}>
      <FloatingSidebar.Header>
        <div className='tox-sidebar-content__title'>Floating Header</div>
      </FloatingSidebar.Header>
      <div style={{ padding: '12px' }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
        Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
        laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
      </div>
    </FloatingSidebar.Root>
  )
};

const resolvedIcon = `<svg width="24" height="24">
    <path d="M17.3 8.2 13.4 12l3.9 3.8a1 1 0 0 1-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 0 1-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 0 1 1.5-1.5l3.8 3.9 3.8-3.9a1 1 0 0 1 1.5 1.5Z" fill-rule="evenodd"></path>
  </svg>
`;

const mockUniverse = {
  getIcon: Fun.constant(resolvedIcon),
};

export const ButtonInHeader: Story = {
  name: 'Button in header',
  args: {
    isOpen: true,
    initialPosition: { x: '30px', y: '30px' },
    origin: 'top-right'
  },
  render: (args: FloatingSidebarProps): JSX.Element => (
    <FloatingSidebar.Root {...args}>
      <FloatingSidebar.Header>
        <div className='tox-sidebar-content__title'>Floating Header</div>
        <div className='tox-sidebar-content__header-close-button'>
          <IconButton variant='naked' icon="close" onClick={() => window.alert('Close the sidebar!')} />
        </div>
      </FloatingSidebar.Header>
      <div style={{ padding: '12px' }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
        Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
        laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
      </div>
    </FloatingSidebar.Root>
  )
};
