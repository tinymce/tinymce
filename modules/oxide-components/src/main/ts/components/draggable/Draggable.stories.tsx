import type { Meta, StoryObj } from '@storybook/react-vite';

import { Draggable, DraggableHandle } from './Draggable';

const meta = {
  title: 'components/Draggable',
  component: Draggable,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'skip-visual-testing' ],
} satisfies Meta<typeof Draggable>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Example: Story = {
  args: { },
  render: (args) => {
    return (
      <Draggable>
        <div
          style={{ width: '200px', height: '200px', backgroundColor: 'lightgray' }}>
          <DraggableHandle>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'black' }}></div>
          </DraggableHandle>
        </div>
      </Draggable>
    );
  }
};
