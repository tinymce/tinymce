import { Draggable } from 'oxide-components/components/draggable/Draggable';
import { classes } from 'oxide-components/utils/Styles';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

const draggableTestId = 'draggable';
const draggableHandleTestId = 'draggable-handle';

const TestElement = (
  <Draggable>
    <div data-testid={draggableTestId} style={{ width: 250, height: 500, backgroundColor: 'gray' }}>
      <Draggable.Handle>
        <div data-testid={draggableHandleTestId} style={{ width: '100%', height: 50, backgroundColor: 'black' }}></div>
      </Draggable.Handle>
    </div>
  </Draggable>
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

  const move = (vector: readonly [number, number]) => {
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

const renderDraggable = async () => {
  const { getByTestId } = render(TestElement, { wrapper: Wrapper });
  const handle = getByTestId(draggableHandleTestId).element() as HTMLElement;
  const draggable = getByTestId(draggableTestId).element() as HTMLElement;
  await expect.element(handle).toBeDefined();
  await expect.element(draggable).toBeDefined();
  const draggableWrapper = draggable.parentElement;
  await expect.element(draggableWrapper).toBeDefined();

  return { handle, draggable, draggableWrapper: draggableWrapper as HTMLElement };
};

/*
  I would prefer to use React's 'act' function.
  But I couldn't find a way to use 'act' with 'vitest-browser-react' library,
  without having error message on the console.
*/
const tick = () => new Promise<void>((res) => setTimeout(() => res()));

const assertTransform = (element: HTMLElement, shift: { x: number; y: number }) => {
  const transform = element.style.transform;
  expect(transform).toBe(`translate3d(${shift.x}px, ${shift.y}px, 0px)`);
};

describe('browser.draggable.Draggable', () => {
  it('TINY-12875: Should be draggable by handle', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const [ shiftX, shiftY ] = [ 50, 50 ];

    const { down, move, up } = mouse(handle);
    down();
    await tick();
    move([ shiftX, shiftY ]);
    await tick();
    up();

    assertTransform(draggableWrapper, { x: shiftX, y: shiftY });
  });

  it('TINY-12875: Should only be draggable by handle', async () => {
    const { draggable, draggableWrapper } = await renderDraggable();

    const { down, move, up } = mouse(draggable);
    down();
    await tick();
    move([ 50, 50 ]);
    await tick();
    up();

    assertTransform(draggableWrapper, { x: 0, y: 0 });
  });

  it('TINY-12875: Shift should be rounded to integer', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const [ shiftX, shiftY ] = [ 2.33, 50.33 ];

    const { down, move, up } = mouse(handle);
    down();
    await tick();
    move([ shiftX, shiftY ]);
    await tick();
    up();

    assertTransform(draggableWrapper, { x: 2, y: 50 });
  });

  it('TINY-12875: Should not exceed border - left top', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const rect = draggableWrapper.getBoundingClientRect();

    // Try to move far beyond the window boundaries
    const largeShift = [ -1 * window.innerWidth * 2, -1 * window.innerHeight * 2 ] as const;

    const { down, move, up } = mouse(handle);
    down();
    await tick();
    move(largeShift);
    await tick();
    up();

    assertTransform(draggableWrapper, { x: Math.ceil(-rect.x), y: Math.ceil(-rect.y) });
  });

  it('TINY-12875: Should not exceed border - right bottom', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const rect = draggableWrapper.getBoundingClientRect();

    // Try to move far beyond the window boundaries
    const largeShift = [ window.innerWidth * 2, window.innerHeight * 2 ] as const;

    const { down, move, up } = mouse(handle);
    down();
    await tick();
    move(largeShift);
    await tick();
    up();

    assertTransform(draggableWrapper, {
      x: Math.floor(window.innerWidth - (rect.x + rect.width)),
      y: Math.floor(window.innerHeight - (rect.y + rect.height))
    });
  });
});
