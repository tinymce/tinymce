import { FocusTools, TestStore } from '@ephox/agar';
import { SugarElement } from '@ephox/sugar';
import type { Meta, ReactRenderer, StoryObj } from '@storybook/react-vite';
import { forwardRef, useRef, type ReactElement } from 'react';
import type { PartialStoryFn } from 'storybook/internal/csf';
import { expect, userEvent, within } from 'storybook/test';

import { useFlowKeyNavigation } from '../KeyboardNavigationHooks';

import { FlowTypeDemo } from './FlowTypeDemo';

const styles = `.stay:focus {
    background-color: #cadbee;
  }
  .skip:focus {
    background-color: red;
  }
`;

const store = TestStore();

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
  beforeEach: async () => {
    store.clear();
  },
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
      FocusTools.setFocus(SugarElement.fromDom(container), context.args.selector);
    }
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

interface ItemProps {
  classes: string[];
  name: string;
  store: TestStore;
}

const Item = ({ classes, name, store }: ItemProps) =>
  (
    <span
      className={classes.join(' ')}
      style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '2px',
        border: '1px solid ' + (classes.includes('stay') ? 'blue' : 'yellow')
      }}
      tabIndex={-1}
      onClick={store.adder('item.execute: ' + name)}
    />
  );

const Container = forwardRef<HTMLDivElement, { store: TestStore; testId: string }>(({ store, testId }, ref) => (
  <div
    data-testid={testId}
    ref={ref}
    className="flow-keying-test"
    style={{
      background: 'white',
      width: '200px',
      height: '200px'
    }}
  >
    <Item classes={[ 'stay', 'one' ]} name="one" store={store} />
    <Item classes={[ 'stay', 'two' ]} name="two" store={store} />
    <Item classes={[ 'skip', 'three' ]} name="three" store={store} />
    <Item classes={[ 'skip', 'four' ]} name="four" store={store} />
    <Item classes={[ 'stay', 'five' ]} name="five" store={store} />
  </div>
));

const sequence = async (doc: Document, key: string, identifiers: Array<{ label: string; selector: string }>) => {
  for (let i = 0; i < identifiers.length; i++) {
    await userEvent.keyboard(`{${key}}`);
    const element = doc.querySelector(identifiers[i].selector);
    await expect(element, 'Focus should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label).toHaveFocus();
  }
};

const targets = {
  one: { label: 'one', selector: '.one' },
  two: { label: 'two', selector: '.two' },
  five: { label: 'five', selector: '.five' }
};

export const FlowKeyingWithCycles: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    useFlowKeyNavigation({
      containerRef: ref,
      selector: '.stay',
      escape: store.adderH('flow.onEscape'),
      cycles: true,
    });
    return (
      <Container ref={ref} store={store} testId='container' />
    );
  },
  play: async ({ canvasElement, step }) => {
    const doc = canvasElement.ownerDocument;
    const container = within(canvasElement).getByTestId('container');
    FocusTools.setFocus(SugarElement.fromDom(container), '.one');

    await step('Navigate right', async () => {
      await sequence(
        doc,
        'ArrowRight',
        [
          targets.two,
          targets.five,
          targets.one,
          targets.two,
          targets.five,
          targets.one
        ]
      );
    });
    await step('Navigate left', async () => {
      await sequence(
        doc,
        'ArrowLeft',
        [
          targets.five,
          targets.two,
          targets.one,
          targets.five,
          targets.two,
          targets.one
        ]
      );
    });
    await step('Navigate up', async () => {
      await sequence(
        doc,
        'ArrowUp',
        [
          targets.five,
          targets.two,
          targets.one,
          targets.five,
          targets.two,
          targets.one
        ]
      );
    });
    await step('Navigate down', async () => {
      await sequence(
        doc,
        'ArrowDown',
        [
          targets.two,
          targets.five,
          targets.one,
          targets.two,
          targets.five,
          targets.one
        ]
      );
    });

    // Test execute
    await step('Test execute', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(
        () => store.assertEq('Check that execute has fired on the right target', [ 'item.execute: one' ])
      ).not.toThrow();
      store.clear();
    });

    await step('Test escape', async () => {
      await userEvent.keyboard('{Escape}');
      store.assertEq('Check that escape handler has fired', [ 'flow.onEscape' ]);
    });
  },
};

export const FlowKeyingWithoutCycles: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    useFlowKeyNavigation({
      containerRef: ref,
      selector: '.stay',
      escape: store.adderH('flow.onEscape'),
      cycles: false,
    });
    return (
      <Container ref={ref} store={store} testId='container' />
    );
  },
  play: async ({ canvasElement, step }) => {
    const doc = canvasElement.ownerDocument;
    const container = within(canvasElement).getByTestId('container');
    FocusTools.setFocus(SugarElement.fromDom(container), '.one');

    await step('TINY-9429: Flow with cycles false should stop on the first element when left is pressed and on the last when right is pressed', async () => {

      await step('Navigate Right', async () => {
        await sequence(
          doc,
          'ArrowRight',
          [
            targets.two,
            targets.five,
            targets.five,
          ]
        );
      });

      await step('Navigate Left', async () => {
        await sequence(
          doc,
          'ArrowLeft',
          [
            targets.two,
            targets.one,
            targets.one,
          ]
        );
      });

      await step('Test execute', async () => {
        await userEvent.keyboard('{Enter}');
        const executeAssertion = () => {
          store.assertEq('Check that execute has fired on the right target', [ 'item.execute: one' ]);
        };
        await expect(executeAssertion).not.toThrow();
        store.clear();
      });

      await step('Test escape', async () => {
        await userEvent.keyboard('{Escape}');
        const escapeAssertion = () => {
          store.assertEq('Check that escape handler has fired', [ 'flow.onEscape' ]);
        };
        await expect(escapeAssertion).not.toThrow();
      });
    });

  },
};
