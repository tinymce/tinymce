import { Optional } from '@ephox/katamari';
import { Focus, SelectorFind, SugarElement } from '@ephox/sugar';
import { userEvent } from '@vitest/browser/context';
import { useTabKeyNavigation } from 'oxide-components/keynav/KeyboardNavigationHooks';
import React, { forwardRef, useRef } from 'react';
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

const sequence = async (doc: Document, keyCombo: string, identifiers: Array<{ label: string; selector: string }>) => {
  for (let i = 0; i < identifiers.length; i++) {
    await userEvent.keyboard(keyCombo);
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

describe('KeynavTabbingTypeTest', () => {

  beforeEach(() => {
    clearStore(store);
  });

  it('Should handle keyboard navigation using Tab key', async () => {

    const TabKeyingWithCycles = () => {
      const ref = useRef<HTMLDivElement>(null);
      useTabKeyNavigation({
        containerRef: ref,
        selector: '.stay',
        execute: (focused) => {
          focused.dom.click();
          return Optional.some(true);
        },
        escape: () => {
          store.push('tab.onEscape');
          return Optional.some(true);
        },
        cyclic: true
      });
      return (
        <Container ref={ref} store={store} testId='container' />
      );
    };

    const { getByTestId, baseElement } = render(<TabKeyingWithCycles />, {
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
      '{Tab}',
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
      '{Shift>}{Tab}{/Shift}',
      [
        targets.five,
        targets.two,
        targets.one,
        targets.five,
        targets.two,
        targets.one
      ]
    );

    // Test execute
    await userEvent.keyboard('{Enter}');
    expect(store, 'Check that execute has fired on the right target').toEqual([ 'item.execute: one' ]);
    clearStore(store);

    await userEvent.keyboard('{Escape}');
    expect(store, 'Check that escape handler has fired').toEqual([ 'tab.onEscape' ]);

  });

  it('Should handle keyboard navigation using Tab key in a tree structure', async () => {

    const InnerLevel: React.FC<{ index: number }> = ({ index }) => {
      const ref = useRef<HTMLDivElement>(null);

      useTabKeyNavigation({
        containerRef: ref,
        selector: '.item',
        escape: (focused) => {
          Focus.focus(SelectorFind.ancestor<HTMLElement>(focused, '.inner-level').getOrDie());
          return Optional.some(true);
        },
      });

      return (
        <div
          className={`inner-level square-${index} stay`}
          ref={ref}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          tabIndex={-1}
          data-testid={`inner-${index}`}
        >
          {
            [ 0, 1, 2 ].map((_, idx) => (
              <div
                key={idx}
                data-testid={`item-${index}-${idx + 1}`}
                className={`item square-${idx + 1} stay`}
                tabIndex={-1}
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  margin: '2px',
                  textAlign: 'center',
                  border: '1px solid blue',
                }}>
                {idx + 1}
              </div>
            ))
          }
        </div>
      );
    };

    const TabKeyingInTree = () => {
      const outerRef = useRef<HTMLDivElement>(null);

      useTabKeyNavigation({
        containerRef: outerRef,
        selector: '.inner-level',
        execute: (focused) => {
          Focus.focus(SelectorFind.descendant<HTMLElement>(focused, '.item').getOrDie());
          return Optional.some(true);
        },
      });

      return (
        <div
          className='outer-level'
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid black',
            padding: '2px',
            margin: '2px',
            gap: '4px'
          }}
          data-testid='root'
          ref={outerRef}
        >
          <InnerLevel index={1}/>
          <InnerLevel index={2}/>
          <InnerLevel index={3}/>
        </div>
      );
    };

    const { getByTestId, baseElement } = render(<TabKeyingInTree />, {
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
    const container = getByTestId('root');
    const firstChild = SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(container.element()), '.stay').getOrDie();
    Focus.focus(firstChild);

    let targets = {
      one: { label: 'one', selector: '.inner-level.square-1' },
      two: { label: 'two', selector: '.inner-level.square-2' },
      three: { label: 'three', selector: '.inner-level.square-3' }
    };
    // Tabbing between inner levels
    await sequence(doc, '{Tab}', [ targets.two, targets.three ]);

    // Shift Tabbing between elements to get back to initial inner level
    await sequence(doc, '{Shift>}{Tab}{/Shift}', [ targets.two, targets.one ]);

    // Press Enter to get inside the inner level and focus on the first item
    await userEvent.keyboard('{Enter}');
    const itemOne = getByTestId('item-1-1');
    await expect.element(itemOne).toHaveFocus();

    targets = {
      one: { label: 'one', selector: '.item.square-1' },
      two: { label: 'two', selector: '.item.square-2' },
      three: { label: 'three', selector: '.item.square-3' }
    };

    // Tabbing between items
    await sequence(doc, '{Tab}', [ targets.two, targets.three ]);

    // Press Escape to get outside the item into the parent inner level
    await userEvent.keyboard('{Escape}');
    const innerOne = getByTestId('inner-1');
    await expect.element(innerOne).toHaveFocus();
  });

});
