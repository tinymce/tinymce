import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Draggable from './Draggable';
import type { DraggableProps } from './internals/types';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/Draggable',
  component: Draggable.Root,
  parameters: {
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs', 'skip-visual-testing' ],
} satisfies Meta<typeof Draggable.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: DraggableProps): JSX.Element => (
  <Draggable.Root {...args} />
);

export const Example: Story = {
  args: {
    children: (
      <div style={{ width: 250, height: 500, backgroundColor: 'gray' }}>
        <Draggable.Handle>
          <div style={{ width: '100%', height: 50, backgroundColor: 'black' }}></div>
        </Draggable.Handle>
      </div>
    )
  },
  parameters: {},
  render,
};
