import * as Draggable from 'oxide-components/components/draggable/Draggable';
import type { DraggableProps } from 'oxide-components/components/draggable/internals/types';
import { classes } from 'oxide-components/utils/Styles';
import type { ReactNode } from 'react';
import { describe, expect, it, afterEach, beforeAll } from 'vitest';
import { userEvent, page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import * as Mouse from './utils/Mouse';

const draggableTestId = 'draggable';
const draggableHandleTestId = 'draggable-handle';
const draggableContentTestId = 'draggable-content';

const createTestElement = (size: { width: number; height: number }, props: DraggableProps = {}) => (
  <Draggable.Root style={{ position: 'absolute' }} {...props}>
    <div data-testid={draggableTestId} style={{ ...size }}>
      <Draggable.Handle>
        <div data-testid={draggableHandleTestId} style={{ width: '100%', height: 50, backgroundColor: '#e8d96f' }}></div>
      </Draggable.Handle>
      <div data-testid={draggableContentTestId} style={{ backgroundColor: '#fef68a', height: size.height - 50 }}></div>
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
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

const renderDraggable = async (size: { width: number; height: number } = { width: 250, height: 300 }, props?: DraggableProps) => {
  const { getByTestId } = render(createTestElement(size, props), { wrapper: Wrapper });
  const handle = getByTestId(draggableHandleTestId).element() as HTMLElement;
  const content = getByTestId(draggableContentTestId).element() as HTMLElement;
  const draggable = getByTestId(draggableTestId).element() as HTMLElement;

  await expect.element(handle).toBeDefined();
  await expect.element(content).toBeDefined();
  await expect.element(draggable).toBeDefined();

  const draggableWrapper = draggable.parentElement;
  await expect.element(draggableWrapper).toBeDefined();

  return { handle, content, draggable, draggableWrapper: draggableWrapper as HTMLElement };
};

const dragTo = async (element: HTMLElement, position: { top: number; left: number }) => {
  // I assume that element is at least 11x11 for this to work correctly
  await userEvent.hover(element, { position: { x: 10, y: 10 }});
  await Mouse.down();
  await Mouse.move(position.left + 10, position.top + 10);
  await Mouse.up();
};

const assertPosition = (element: HTMLElement, position: { top: number; left: number }) => {
  const rect = element.getBoundingClientRect();
  expect(rect.top).toBe(position.top);
  expect(rect.left).toBe(position.left);
};

describe('browser.draggable.Draggable', () => {
  let originalViewport = { width: 0, height: 0 };

  beforeAll(async () => {
    originalViewport = { width: window.innerWidth, height: window.innerHeight };
  });

  afterEach(async () => {
    await page.viewport(originalViewport.width, originalViewport.height);
  });

  it('TINY-12875: Should be draggable by handle', async () => {
    await page.viewport(1500, 1500);
    const { handle, draggableWrapper } = await renderDraggable();
    await dragTo(handle, { top: 50, left: 50 });
    assertPosition(draggableWrapper, { top: 50, left: 50 });
  });

  it('TINY-12875: Should only be draggable by handle', async () => {
    await page.viewport(1500, 1500);
    const { content, draggableWrapper } = await renderDraggable();
    await dragTo(content, { top: 50, left: 50 });
    assertPosition(draggableWrapper, { top: 0, left: 0 });
  });

  it('TINY-12875: Should not exceed boundaries', async () => {
    const viewportWidth = 1500;
    const viewportHeight = 1300;
    const elementWidth = 300;
    const elementHeight = 250;

    await page.viewport(viewportWidth, viewportHeight);
    const { handle, draggableWrapper } = await renderDraggable({ width: elementWidth, height: elementHeight });

    // Left boundary
    await dragTo(handle, { top: 0, left: -100 });
    assertPosition(draggableWrapper, { top: 0, left: 0 });

    // Right boundary
    await dragTo(handle, { top: 0, left: viewportWidth + 100 });
    assertPosition(draggableWrapper, { top: 0, left: viewportWidth - elementWidth });

    // Top boundary
    await dragTo(handle, { top: -100, left: 0 });
    assertPosition(draggableWrapper, { top: 0, left: 0 });

    // Bottom boundary
    await dragTo(handle, { top: viewportHeight + 100, left: 0 });
    assertPosition(draggableWrapper, { top: viewportHeight - elementHeight, left: 0 });
  });

  it('TINY-12875: Should not exceed boundaries while dragging', async () => {
    const viewportWidth = 1500;
    const viewportHeight = 1300;
    const elementWidth = 300;
    const elementHeight = 250;

    await page.viewport(viewportWidth, viewportHeight);
    const { handle, draggableWrapper } = await renderDraggable({ width: elementWidth, height: elementHeight });

    // Start dragging
    await userEvent.hover(handle, { position: { x: 10, y: 10 }});
    await Mouse.down();

    // Left boundary
    await Mouse.move(-100, 0);
    assertPosition(draggableWrapper, { top: 0, left: 0 });

    // Right boundary
    await Mouse.move(viewportWidth + 100, 0);
    assertPosition(draggableWrapper, { top: 0, left: viewportWidth - elementWidth });

    // Top boundary
    await Mouse.move(0, -100);
    assertPosition(draggableWrapper, { top: 0, left: 0 });

    // Bottom boundary
    await Mouse.move(0, viewportHeight + 100);
    assertPosition(draggableWrapper, { top: viewportHeight - elementHeight, left: 0 });
  });

  it('TINY-13109: Should stay within the viewport on window resize', async () => {
    const elementWidth = 200;
    const elementHeight = 200;

    await page.viewport(1500, 1500);
    const componentProps = { declaredSize: { width: `${elementWidth}px`, height: `${elementHeight}px` }};
    const { handle, draggableWrapper } = await renderDraggable({ width: elementWidth, height: elementHeight }, componentProps);
    await dragTo(handle, { top: 1300, left: 1300 });
    assertPosition(draggableWrapper, { top: 1300, left: 1300 });

    await page.viewport(1000, 1000);
    assertPosition(draggableWrapper, { top: 800, left: 800 });

    // Should remember it's initial position (before first resize)
    await page.viewport(2000, 2000);
    assertPosition(draggableWrapper, { top: 1300, left: 1300 });
  });

  it('TINY-13109: Should forget its initial position once dragged after resize', async () => {
    const elementWidth = 200;
    const elementHeight = 200;

    await page.viewport(1500, 1500);
    const componentProps = { declaredSize: { width: `${elementWidth}px`, height: `${elementHeight}px` }};
    const { handle, draggableWrapper } = await renderDraggable({ width: elementWidth, height: elementHeight }, componentProps);
    await dragTo(handle, { top: 1300, left: 1300 });
    assertPosition(draggableWrapper, { top: 1300, left: 1300 });

    await page.viewport(1000, 1000);
    assertPosition(draggableWrapper, { top: 800, left: 800 });

    // Drag again after resize
    await dragTo(handle, { top: 500, left: 500 });
    assertPosition(draggableWrapper, { top: 500, left: 500 });

    await page.viewport(2000, 2000);
    assertPosition(draggableWrapper, { top: 500, left: 500 });
  });

  it('TINY-12875: Should clamp mouse position outside of viewport in x axis', async () => {
    const viewportWidth = 1500;
    const viewportHeight = 1300;
    const elementWidth = 300;
    const elementHeight = 250;

    await page.viewport(viewportWidth, viewportHeight);
    const { handle, draggableWrapper } = await renderDraggable({ width: elementWidth, height: elementHeight });

    // Start dragging
    await userEvent.hover(handle, { position: { x: 30, y: 30 }});
    await Mouse.down();
    await Mouse.move(-50, -50);

    // We should be on the top left boundary now
    assertPosition(draggableWrapper, { top: 0, left: 0 });

    // Move to the starting point in x axis
    await Mouse.move(30, -50);
    assertPosition(draggableWrapper, { top: 0, left: 0 }); // Still on the left boundary

    // Move further than the start dragging point
    await Mouse.move(100, -50);
    assertPosition(draggableWrapper, { top: 0, left: 70 }); // We should move 70px to the right now
  });

  it('TINY-12875: Should clamp mouse position outside of viewport in y axis', async () => {
    const viewportWidth = 1500;
    const viewportHeight = 1300;
    const elementWidth = 300;
    const elementHeight = 250;

    await page.viewport(viewportWidth, viewportHeight);
    const { handle, draggableWrapper } = await renderDraggable({ width: elementWidth, height: elementHeight });

    // Start dragging
    await userEvent.hover(handle, { position: { x: 30, y: 30 }});
    await Mouse.down();
    await Mouse.move(-50, -50);

    // We should be on the top left boundary now
    assertPosition(draggableWrapper, { top: 0, left: 0 });

    // Move to the starting point in y axis
    await Mouse.move(-50, 30);
    assertPosition(draggableWrapper, { top: 0, left: 0 }); // Still on the top left boundary

    // Move further than the start dragging point
    await Mouse.move(-50, 100);
    assertPosition(draggableWrapper, { top: 70, left: 0 }); // We should move 70px down now
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
      <Draggable.Root style={{ position: 'absolute' }}>
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
