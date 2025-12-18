import { Optional } from '@ephox/katamari';
import { Css, type SugarElement } from '@ephox/sugar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useExecutionType } from 'oxide-components/keynav/KeyboardNavigationHooks';
import { useRef } from 'react';

import type { ExecutingConfig } from './ExecutionType';

const meta = {
  title: 'KeyboardNavigationHooks/ExecutionType',
  component: (props: Omit<ExecutingConfig, 'doExecute'>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useExecutionType({
      ...props,
      doExecute: (element: SugarElement<HTMLElement>): Optional<boolean> => {
        if (Css.get(element, 'background') === 'rgb(255, 0, 0)') {
          Css.remove(element, 'background');
        } else {
          Css.set(element, 'background', 'rgb(255, 0, 0)');
        }

        return Optional.from(true);
      },
      containerRef
    });

    return (
      <span
        ref={containerRef}
        style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          margin: '2px',
          border: '1px solid blue'
        }}
        tabIndex={-1}
      />
    );
  },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      story: {
        useSpace: false,
        useEnter: false,
        useControlEnter: false,
        useDown: false,
      }
    }
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: false,
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
        defaultValue: { summary: 'useRef<HTMLElement>(null)' },
      },
    },
    useSpace: {
      control: false,
      type: {
        required: true,
        name: 'boolean',
      },
      description: 'Boolean - determines whether using the spacebar to trigger execution is acceptable',
      table: {
        type: {
          summary: 'using spacebar'
        },
        defaultValue: {
          summary: 'false'
        },
      },
    },
    useEnter: {
      control: false,
      type: {
        required: true,
        name: 'boolean',
      },
      description: 'Boolean - determines whether using the enter button to trigger execution is acceptable',
      table: {
        type: {
          summary: 'using enter'
        },
        defaultValue: {
          summary: 'false'
        },
      },
    },
    useControlEnter: {
      control: false,
      type: {
        required: true,
        name: 'boolean',
      },
      description: 'Boolean - determines whether using the enter button to trigger execution is acceptable, but also requiring control to be pressed. '
        + 'Can be used together or separate from "useEnter", but if used together will add no change in behavior to only using "useEnter".',
      table: {
        type: {
          summary: 'using control enter'
        },
        defaultValue: {
          summary: 'false'
        },
      },
    },
    useDown: {
      control: false,
      type: {
        required: true,
        name: 'boolean',
      },
      description: 'Boolean - determines whether using the down arrow button to trigger execution is acceptable',
      table: {
        type: {
          summary: 'using arrow button'
        },
        defaultValue: {
          summary: 'false'
        },
      },
    },
  },
} satisfies Meta;

export default meta;
export type Story = StoryObj<typeof meta>;

export const None: Story = {
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: false,
  }
};

export const UseSpace: Story = {
  args: {
    useSpace: true,
    useEnter: false,
    useControlEnter: false,
    useDown: false,
  }
};

export const UseEnter: Story = {
  args: {
    useSpace: false,
    useEnter: true,
    useControlEnter: false,
    useDown: false,
  }
};

export const UseEnterControl: Story = {
  args: {
    useSpace: false,
    useEnter: true,
    useControlEnter: true,
    useDown: false,
  }
};

export const UseDown: Story = {
  args: {
    useSpace: false,
    useEnter: false,
    useControlEnter: false,
    useDown: true,
  }
};

export const All: Story = {
  args: {
    useSpace: true,
    useEnter: true,
    useControlEnter: true,
    useDown: true,
  }
};
