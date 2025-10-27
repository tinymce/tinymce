import { userEvent } from '@vitest/browser/context';
import * as Draggable from 'oxide-components/components/draggable/Draggable';
import { classes } from 'oxide-components/utils/Styles';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

import * as Dragging from './utils/Dragging';

const draggableTestId = 'draggable';
const draggableHandleTestId = 'draggable-handle';

const TestElement = (
  <Draggable.Root>
    <div data-testid={draggableTestId} style={{ width: 250, height: 500, backgroundColor: 'gray' }}>
      <Draggable.Handle>
        <div data-testid={draggableHandleTestId} style={{ width: '100%', height: 50, backgroundColor: 'black' }}></div>
      </Draggable.Handle>
    </div>
  </Draggable.Root>
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

const assertTransform = (element: HTMLElement, shift: { x: number; y: number }) => {
  const transform = element.style.transform;
  expect(transform).toBe(`translate3d(${shift.x}px, ${shift.y}px, 0px)`);
};

const getShift = (element: HTMLElement): { x: number; y: number } => {
  const transform = element.style.transform;
  const match = transform.match(/translate3d\((.+)px, (.+)px, (.+)px\)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return { x: 0, y: 0 };
};

describe('browser.draggable.Draggable', () => {
  it('TINY-12875: Should be draggable by handle', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const [ shiftX, shiftY ] = [ 50, 50 ];

    const { down, move, up } = Dragging.mouse(handle);
    down();
    await Dragging.tick();
    move([ shiftX, shiftY ]);
    await Dragging.tick();
    up();

    assertTransform(draggableWrapper, { x: shiftX, y: shiftY });
  });

  it('TINY-12875: Should only be draggable by handle', async () => {
    const { draggable, draggableWrapper } = await renderDraggable();

    const { down, move, up } = Dragging.mouse(draggable);
    down();
    await Dragging.tick();
    move([ 50, 50 ]);
    await Dragging.tick();
    up();

    assertTransform(draggableWrapper, { x: 0, y: 0 });
  });

  it('TINY-12875: Shift should be rounded to integer', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const [ shiftX, shiftY ] = [ 2.33, 50.33 ];

    const { down, move, up } = Dragging.mouse(handle);
    down();
    await Dragging.tick();
    move([ shiftX, shiftY ]);
    await Dragging.tick();
    up();

    assertTransform(draggableWrapper, { x: 2, y: 50 });
  });

  it('TINY-12875: Should not exceed border - left top', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const rect = draggableWrapper.getBoundingClientRect();

    // Try to move far beyond the window boundaries
    const largeShift = [ window.innerWidth * -2, window.innerHeight * -2 ] as const;

    const { down, move, up } = Dragging.mouse(handle);
    down();
    await Dragging.tick();
    move(largeShift);
    await Dragging.tick();
    up();

    assertTransform(draggableWrapper, { x: Math.ceil(-rect.x), y: Math.ceil(-rect.y) });
  });

  it('TINY-12875: Should not exceed border - right bottom', async () => {
    const { handle, draggableWrapper } = await renderDraggable();
    const rect = draggableWrapper.getBoundingClientRect();

    // Try to move far beyond the window boundaries
    const largeShift = [ window.innerWidth * 2, window.innerHeight * 2 ] as const;

    const { down, move, up } = Dragging.mouse(handle);
    down();
    await Dragging.tick();
    move(largeShift);
    await Dragging.tick();
    up();

    assertTransform(draggableWrapper, {
      x: Math.floor(window.innerWidth - (rect.x + rect.width)),
      y: Math.floor(window.innerHeight - (rect.y + rect.height))
    });
  });

  it('TINY-12875: Should clamp mouse position outside of viewport in x axis', async () => {
    const { handle, draggableWrapper } = await renderDraggable();

    const { down, move, up } = Dragging.mouse(handle);
    move([ 10, 10 ]); // Set the pointer inside handle, but 10px from top of the handle and 10px from left
    await Dragging.tick();
    down();
    await Dragging.tick();
    move([ window.innerWidth * 2, 0 ]); // Move the pointer outside of the viewport in x axis
    await Dragging.tick();
    const currentShift = getShift(draggableWrapper); // current shift is a maximum shift in x axis
    move([ -5, 0 ]); // Move 5px to the left - this action should be ignored
    await Dragging.tick();
    assertTransform(draggableWrapper, currentShift); // Assert that previous action was ignored
    move([ -1 * (window.innerWidth * 2), 0 ]); // Revert the big shift from the beginning
    await Dragging.tick();
    up();
    await Dragging.tick();

    assertTransform(draggableWrapper, { x: -5, y: 0 }); // Element should only be moved a little to the left now
  });

  it('TINY-12875: Should clamp mouse position outside of viewport in y axis', async () => {
    const { handle, draggableWrapper } = await renderDraggable();

    const { down, move, up } = Dragging.mouse(handle);
    move([ 10, 10 ]); // Set the pointer inside handle, but 10px from top of the handle and 10px from left
    await Dragging.tick();
    down();
    await Dragging.tick();
    move([ 0, window.innerHeight * 2 ]); // Move the pointer outside of the viewport in y axis
    await Dragging.tick();
    const currentShift = getShift(draggableWrapper); // current shift is a maximum shift in y axis
    move([ 0, -5 ]); // Move 5px above - this action should be ignored
    await Dragging.tick();
    assertTransform(draggableWrapper, currentShift); // Assert that previous action was ignored
    move([ 0, -1 * (window.innerHeight * 2) ]); // Revert the big shift from the beginning
    await Dragging.tick();
    up();
    await Dragging.tick();

    assertTransform(draggableWrapper, { x: 0, y: -5 }); // Element should only be moved a little to the top now
  });

  it('TINY-12875: Should throw an error when Draggable.Handle rendered outside of Draggable', async () => {
    expect(() => {
      render(
        <Draggable.Handle>
          <div data-testid={draggableHandleTestId} style={{ width: '100%', height: 50, backgroundColor: 'black' }}></div>
        </Draggable.Handle>
        , { wrapper: Wrapper }
      );
    }).toThrow('Draggable compound components must be rendered within the Draggable component');
  });

  it('TINY-13102: Should allow button inside Draggable.Handle to be clicked', async () => {
    let clickCount = 0;
    const handleClick = () => {
      clickCount++;
    };

    const TestElementWithButton = (
      <Draggable.Root>
        <div data-testid={draggableTestId} style={{ width: 250, height: 500, backgroundColor: 'gray' }}>
          <Draggable.Handle>
            <div data-testid={draggableHandleTestId} style={{ width: '100%', height: 50, backgroundColor: 'black' }}>
              <button data-testid="button-in-handle" onClick={handleClick}>Click me</button>
            </div>
          </Draggable.Handle>
        </div>
      </Draggable.Root>
    );

    const { getByTestId } = render(TestElementWithButton, { wrapper: Wrapper });
    const button = getByTestId('button-in-handle').element();
    await expect.element(button).toBeDefined();

    await userEvent.click(button);

    expect(clickCount).toBe(1);
  });
});
