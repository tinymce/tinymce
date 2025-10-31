import { Fun } from '@ephox/katamari';
import type { Meta, StoryObj } from '@storybook/react-vite';

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
        component: `A draggable floating sidebar component that uses the Popover API and can be positioned anywhere on the screen.

## How it works

The FloatingSidebar is built on top of the Draggable component and uses the browser's Popover API for overlay management.
It consists of two parts:

- **\`FloatingSidebar.Root\`** - The container that manages the sidebar's position, visibility, and popover behavior.
- **\`FloatingSidebar.Header\`** - A required header element that acts as the drag handle for moving the sidebar.

The sidebar can be opened or closed programmatically using the \`isOpen\` prop.
When dragged, the sidebar remains within viewport bounds and maintains its position across window resizes.`
      }
    }
  },
  argTypes: {
    isOpen: {
      description: 'Controls the visibility of the floating sidebar. When `true`, the sidebar is shown; when `false`, it is hidden.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    height: {
      description: 'The requested height of the sidebar in pixels. The actual height may be constrained by viewport size.',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '600' }
      }
    },
    initialPosition: {
      description: `The initial position of the sidebar with x and y coordinates, and an origin point.
The origin determines which corner of the sidebar is anchored to the coordinates:
- \`topleft\`: x and y represent the top-left corner
- \`topright\`: x and y represent the top-right corner
- \`bottomleft\`: x and y represent the bottom-left corner
- \`bottomright\`: x and y represent the bottom-right corner`,
      table: {
        type: { summary: '{ x: number, y: number, origin: "topleft" | "topright" | "bottomleft" | "bottomright" }' },
        defaultValue: { summary: '{ x: 0, y: 0, origin: "topleft" }' }
      }
    }
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs' ],
} satisfies Meta<typeof FloatingSidebar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    isOpen: true,
    initialPosition: { x: 30, y: 30, origin: 'topleft' }
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

export const ButtonInHeader: Story = {
  name: 'Button in header',
  args: {
    isOpen: true,
    initialPosition: { x: 30, y: 30, origin: 'topleft' }
  },
  render: (args: FloatingSidebarProps): JSX.Element => (
    <FloatingSidebar.Root {...args}>
      <FloatingSidebar.Header>
        <div className='tox-sidebar-content__title'>Floating Header</div>
        <div className='tox-sidebar-content__header-close-button'>
          <IconButton variant='naked' icon="close" resolver={Fun.constant(resolvedIcon)} onClick={() => window.alert('Close the sidebar!')} />
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

interface InitialPositionStoryArgs {
  origin: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

export const InitialPosition: StoryObj<InitialPositionStoryArgs & FloatingSidebarProps> = {
  name: 'Initial position',
  args: {
    origin: 'bottomright',
    height: 250,
  },
  argTypes: {
    origin: {
      control: 'radio',
      options: [ 'topleft', 'topright', 'bottomleft', 'bottomright' ],
      description: 'The origin point that determines which corner of the sidebar is anchored to the coordinates'
    },
    isOpen: { table: { disable: true }},
    initialPosition: { table: { disable: true }}
  },
  render: (args): JSX.Element => (
    <>
      <div style={{ position: 'absolute', top: 300, left: 400, height: '15px', width: '15px', backgroundColor: 'red' }}></div>
      <FloatingSidebar.Root
        key={args.origin}
        isOpen={true}
        height={args.height}
        initialPosition={{ x: 400, y: 300, origin: args.origin }}
      >
        <FloatingSidebar.Header>
          <div className='tox-sidebar-content__title'>Floating Header</div>
        </FloatingSidebar.Header>
        <div style={{ padding: '12px' }}>Lorem ipsum dolor sit amet consectetur adipisicing elit.</div>
      </FloatingSidebar.Root>
    </>
  )
};
