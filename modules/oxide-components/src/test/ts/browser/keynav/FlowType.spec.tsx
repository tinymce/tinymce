import { Optional } from '@ephox/katamari';
import { Focus, SelectorFind, SugarElement } from '@ephox/sugar';
import { userEvent } from '@vitest/browser/context';
import { useFlowKeyNavigation } from 'oxide-components/keynav/KeyboardNavigationHooks';
import { forwardRef, useRef } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const styles = `.stay:focus {
    background-color: #cadbee;
  }
  .skip:focus {
    background-color: red;
  }
`;

const store: string[] = [];

const clearStore = (store: string[]) => {
  store.splice(0, store.length);
};

interface ItemProps {
  classes: string[];
  name: string;
  store: string[];
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
      onClick={() => store.push('item.execute: ' + name)}
    />
  );

const Container = forwardRef<HTMLDivElement, { store: string[]; testId: string }>(({ store, testId }, ref) => (
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
    await expect.element(element, {
      message: 'Focus should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label
    }).toHaveFocus();
  }
};

const targets = {
  one: { label: 'one', selector: '.one' },
  two: { label: 'two', selector: '.two' },
  five: { label: 'five', selector: '.five' }
};

describe('KeynavFlowTypeTest', () => {

  beforeEach(() => {
    clearStore(store);
  });

  it('FlowKeying with cycles', async () => {

    const FlowKeyingWithCycles = () => {
      const ref = useRef<HTMLDivElement>(null);
      useFlowKeyNavigation({
        containerRef: ref,
        selector: '.stay',
        escape: () => {
          store.push('flow.onEscape');
          return Optional.some(true);
        },
        cycles: true,
      });
      return (
        <Container ref={ref} store={store} testId='container' />
      );
    };

    const { getByTestId, baseElement } = render(<FlowKeyingWithCycles />, {
      wrapper: ({ children }) => (
        <>
          <style>
            {styles}
          </style>
          <div className='tox'>
            {children}
          </div>
        </>
      )
    });
    const doc = baseElement.ownerDocument;
    const container = getByTestId('container');
    const firstChild = SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(container.element()), '.one').getOrDie();
    Focus.focus(firstChild);

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

    // Test execute
    await userEvent.keyboard('{Enter}');
    expect(store, 'Check that execute has fired on the right target').toEqual([ 'item.execute: one' ]);
    clearStore(store);

    await userEvent.keyboard('{Escape}');
    expect(store, 'Check that escape handler has fired').toEqual([ 'flow.onEscape' ]);

  });

  it('TINY-9429: Flow with cycles false should stop on the first element when left is pressed and on the last when right is pressed', async () => {

    const FlowKeyingWithoutCycles = () => {
      const ref = useRef<HTMLDivElement>(null);
      useFlowKeyNavigation({
        containerRef: ref,
        selector: '.stay',
        escape: () => {
          store.push('flow.onEscape');
          return Optional.some(true);
        },
        cycles: false,
      });
      return (
        <Container ref={ref} store={store} testId='container' />
      );
    };

    const { getByTestId, baseElement } = render(<FlowKeyingWithoutCycles />, {
      wrapper: ({ children }) => (
        <>
          <style>
            {styles}
          </style>
          <div className='tox'>
            {children}
          </div>
        </>
      )
    });
    const doc = baseElement.ownerDocument;
    const container = getByTestId('container');
    const firstChild = SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(container.element()), '.one').getOrDie();
    Focus.focus(firstChild);

    await sequence(
      doc,
      'ArrowRight',
      [
        targets.two,
        targets.five,
        targets.five,
      ]
    );

    await sequence(
      doc,
      'ArrowLeft',
      [
        targets.two,
        targets.one,
        targets.one
      ]
    );

    // Test execute
    await userEvent.keyboard('{Enter}');
    expect(store, 'Check that execute has fired on the right target').toEqual([ 'item.execute: one' ]);
    clearStore(store);

    await userEvent.keyboard('{Escape}');
    expect(store, 'Check that escape handler has fired').toEqual([ 'flow.onEscape' ]);

  });
});
