import { Optional } from '@ephox/katamari';
import { Css, type SugarElement } from '@ephox/sugar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEscapeKeyNavigation } from 'oxide-components/keynav/KeyboardNavigationHooks';
import { useEffect, useRef } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'KeyboardNavigationHooks/Escaping',
  component: (): React.ReactElement => {
    const ref = useRef<HTMLElement>(null);
    useEscapeKeyNavigation({
      containerRef: ref,
      onEscape: (element: SugarElement<HTMLElement>): Optional<boolean> => {
        if (Css.get(element, 'background') === 'rgb(255, 0, 0)') {
          Css.remove(element, 'background');
        } else {
          Css.set(element, 'background', 'rgb(255, 0, 0)');
        }

        return Optional.from(true);
      },
    });
    useEffect(() => {
      if (ref.current) {
        ref.current.focus();
      }
    }, []);

    return (
      <span
        ref={ref}
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
        autoplay: true
      }
    }
  },
  tags: [ 'autodocs', 'skip-visual-testing' ],
  args: {
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
    }
  },
} satisfies Meta;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
