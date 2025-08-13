import type { Meta, ReactRenderer, StoryObj } from '@storybook/react-vite';
import { type ReactElement } from 'react';
import type { PartialStoryFn } from 'storybook/internal/csf';

import { FlowKeyingWithCycles } from './stories/FlowKeyingWithCycles.story';
import { FlowKeyingWithoutCycles } from './stories/FlowKeyingWithoutCycles.story';
import { FlowTypeDemo } from './stories/FlowTypeDemo';

const styles = `.stay:focus {
    background-color: #cadbee;
  }
  .skip:focus {
    background-color: red;
  }
`;

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'KeyboardNavigationHooks/FlowKey',
  component: FlowTypeDemo,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      story: {
        autoplay: true
      }
    }
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
  decorators: [
    (Story: PartialStoryFn<ReactRenderer>): ReactElement => (
      <>
        <style>
          {styles}
        </style>
        <Story />
      </>
    )
  ],
  args: {
    selector: '.stay',
  },
  argTypes: {
    containerRef: {
      control: false,
      type: {
        required: true,
        name: 'other',
        value: 'RefObject<HTMLElement>'
      },
      description: 'RefObject<HTMLElement> - Reference to the container element that will handle keyboard navigation',
      table: {
        type: { summary: 'RefObject<HTMLElement>' },
        defaultValue: { summary: 'useRef<HTMLDivElement>(null)' },
      },
    }
  },
  play: ({ canvasElement, context }) => {
    const container = canvasElement.ownerDocument.querySelector('.container');
    if (container) {
      const firstFocusableItem = container.querySelector(context.args.selector);
      firstFocusableItem?.focus();
    }
  },
} satisfies Meta;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export {
  FlowKeyingWithCycles,
  FlowKeyingWithoutCycles
};
;
