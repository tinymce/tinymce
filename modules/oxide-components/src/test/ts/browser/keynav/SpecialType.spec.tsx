import { Optional } from '@ephox/katamari';
import { useSpecialKeyNavigation } from 'oxide-components/keynav/KeyboardNavigationHooks';
import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

const store: string[] = [];

const clearStore = () => {
  store.splice(0, store.length);
};

const storeAdderH = (value: string) => () => {
  store.push(value);
  return Optional.some(true);
};

describe('KeynavSpecialTypeTest', () => {

  it('Should handle keyboard navigation using special keying mode', async () => {

    const Container = () => {
      const ref = useRef<HTMLDivElement>(null);
      useSpecialKeyNavigation({
        containerRef: ref,
        onSpace: storeAdderH('space'),
        onEnter: storeAdderH('enter'),
        onShiftEnter: storeAdderH('shift+enter'),
        onLeft: storeAdderH('left'),
        onUp: storeAdderH('up'),
        onDown: storeAdderH('down'),
        onRight: storeAdderH('right'),
        onEscape: storeAdderH('escape')
      });
      return (
        <div
          ref={ref}
          className="special-keying"
          data-testid="container"
          tabIndex={-1}
          style={{
            width: '100px',
            height: '100px',
            border: '1px solid black'
          }}
        />
      );
    };

    const press = async (expected: string, keyCombo: string) => {
      clearStore();
      await userEvent.keyboard(keyCombo);
      expect(store, 'Pressing ' + expected).toEqual([ expected ]);
    };

    const { getByTestId } = render(<Container />, {
      wrapper: ({ children }) => <div className='tox'>{children}</div>
    });

    const container = getByTestId('container');
    await userEvent.click(container);
    await expect.element(container).toHaveFocus();

    await press('space', ' ');
    await press('enter', '{Enter}');
    await press('shift+enter', '{Shift>}{Enter}{/Shift}');
    await press('left', '{ArrowLeft}');
    await press('up', '{ArrowUp}');
    await press('down', '{ArrowDown}');
    await press('right', '{ArrowRight}');
    await press('escape', '{Escape}');

  });

  it('TINYMCE-14489: Should call updated callbacks without re-subscribing', async () => {

    const Container = () => {
      const ref = useRef<HTMLDivElement>(null);
      const [ count, setCount ] = useState(0);

      useSpecialKeyNavigation({
        containerRef: ref,
        onEnter: () => {
          store.push(`enter-${count}`);
        },
        onSpace: () => {
          setCount((c) => c + 1);
        }
      });

      return (
        <div
          ref={ref}
          className="special-keying"
          data-testid="container"
          tabIndex={-1}
          style={{
            width: '100px',
            height: '100px',
            border: '1px solid black'
          }}
        >
          Count: {count}
        </div>
      );
    };

    const { getByTestId } = render(<Container />, {
      wrapper: ({ children }) => <div className='tox'>{children}</div>
    });

    const container = getByTestId('container');
    await userEvent.click(container);
    await expect.element(container).toHaveFocus();

    clearStore();
    await userEvent.keyboard('{Enter}');
    expect(store, 'Initial enter should log count 0').toEqual([ 'enter-0' ]);

    clearStore();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Enter}');
    expect(store, 'After incrementing, enter should log count 1').toEqual([ 'enter-1' ]);

    clearStore();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Enter}');
    expect(store, 'After incrementing again, enter should log count 2').toEqual([ 'enter-2' ]);

  });
});
