import type { Meta, StoryObj } from '@storybook/react-vite';

import * as FloatingSidebar from './FloatingSidebar';
import type { FloatingSidebarProps } from './FloatingSidebar';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'components/FloatingSidebar',
  component: FloatingSidebar.Root,
  parameters: {
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: [ 'autodocs' ],
} satisfies Meta<typeof FloatingSidebar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: FloatingSidebarProps): JSX.Element => (
  <FloatingSidebar.Root {...args} />
);

export const Example: Story = {
  args: {
    isOpen: true,
    children: [
      <FloatingSidebar.Header key={0}>
        <div className='tox-sidebar-content__title'>Floating Header</div>
      </FloatingSidebar.Header>,
      <div key={1} style={{ padding: '12px' }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora vero facilis voluptatum inventore ad veniam quibusdam.
        Ratione excepturi veniam facilis ducimus, officia deleniti minus repellendus esse expedita quo veritatis ut labore,
        laborum velit soluta ipsam blanditiis ipsa itaque aut architecto incidunt qui voluptatum ea?
      </div>
    ],
  },
  parameters: {},
  render,
};
