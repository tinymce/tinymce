import { Draggable } from 'oxide-components/components/draggable/Draggable';
import { classes } from 'oxide-components/utils/Styles';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const draggableTestId = 'draggable';
const draggableHandleTestId = 'draggable-handle';

const TestElement = (
  <div data-testid={draggableTestId} style={{ width: 250, height: 500, backgroundColor: 'gray' }}>
    <Draggable.Handle>
      <div data-testid={draggableHandleTestId} style={{ width: '100%', height: 50, backgroundColor: 'black' }}></div>
    </Draggable.Handle>
  </div>
);

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className={classes([ 'tox' ])}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px'
      }}>
        <div style={{
          width: '120px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const mouse = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const position = { x: rect.x, y: rect.y };

  const down = () => {
    element.dispatchEvent(new window.PointerEvent('pointerdown', {
      clientX: position.x,
      clientY: position.y,
      pointerId: 1,
      bubbles: true
    }));
  };

  const move = (vector: [number, number]) => {
    position.x = position.x + vector[0];
    position.y = position.y + vector[1];

    element.dispatchEvent(new window.PointerEvent('pointermove', {
      clientX: position.x,
      clientY: position.y,
      pointerId: 1,
      bubbles: true
    }));
  };

  const up = () => {
    element.dispatchEvent(new window.PointerEvent('pointerup', {
      clientX: position.x,
      clientY: position.y,
      pointerId: 1,
      bubbles: true
    }));
  };

  return { down, move, up };
};

describe('browser.draggable.Draggable', () => {
  it('TINY-12875: Sanity check', async () => {
    const { getByTestId } = render(TestElement, { wrapper: Wrapper });
    await expect.element(getByTestId(draggableTestId)).toBeDefined();
    await expect.element(getByTestId(draggableHandleTestId)).toBeDefined();
  });

  it('TINY-12875: Should be draggable by handle', async () => {
    const { getByTestId } = render(TestElement, { wrapper: Wrapper });
    const draggable = getByTestId(draggableTestId).element() as HTMLElement;
    const handle = getByTestId(draggableHandleTestId).element() as HTMLElement;
    const initialPosition = draggable.getBoundingClientRect();
    const [ shiftX, shiftY ] = [ 50, 50 ];

    const { down, move, up } = mouse(handle);
    down();
    move([ shiftX, shiftY ]);
    up();

    const currentPosition = draggable.getBoundingClientRect();
    expect(currentPosition.x).toBe(initialPosition.x);
    expect(currentPosition.y).toBe(initialPosition.y);
  });
});
