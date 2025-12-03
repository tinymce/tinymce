import { Optional } from '@ephox/katamari';
import { userEvent } from '@vitest/browser/context';
import { useSpecialKeyNavigation } from 'oxide-components/keynav/KeyboardNavigationHooks';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
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
});
