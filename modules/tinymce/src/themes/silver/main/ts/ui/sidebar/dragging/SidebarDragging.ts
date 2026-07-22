import { AddEventsBehaviour, type AlloyComponent, AlloyEvents, type Behaviour, NativeEvents } from '@ephox/alloy';
import { Cell, Optional } from '@ephox/katamari';
import { Css, type EventArgs, SelectorFind } from '@ephox/sugar';

import { boundaries, clamp, delta, position } from './Calculations';
import type { AllowedOverflow, Boundaries, CssPosition, CssSize, Origin, Position, Shift } from './DragTypes';
import { getPositioningStyles } from './Styles';

const ORIGIN: Origin = 'top-right';
const INITIAL_POSITION: CssPosition = {
  x: 'var(--tox-private-pad-lg, 24px)',
  y: 'var(--tox-private-pad-lg, 24px)'
};
const ALLOWED_OVERFLOW: AllowedOverflow = { horizontal: 0.8, vertical: 0 };
const DECLARED_SIZE: Optional<CssSize> = Optional.some({
  width: 'var(--tox-private-floating-sidebar-width)',
  height: 'var(--tox-private-floating-sidebar-height)'
});

const applyStylesFor = (comp: AlloyComponent, shift: Shift, position: CssPosition | Position, isDragging: boolean): void => {
  const styles = getPositioningStyles(shift, position, ORIGIN, ALLOWED_OVERFLOW, isDragging, DECLARED_SIZE);
  Css.setOptions(comp.element, {
    transform: Optional.from(styles.transform),
    top: Optional.from(styles.top),
    bottom: Optional.from(styles.bottom),
    left: Optional.from(styles.left),
    right: Optional.from(styles.right)
  });
};

// Apply a resting (not-dragging) position. Used by the orchestrator to sync all sidebars.
const applyPositionStyles = (comp: AlloyComponent, position: CssPosition | Position): void =>
  applyStylesFor(comp, { x: 0, y: 0 }, position, false);

const setupSidebarDragging = (positionState: Cell<CssPosition | Position>, onDragEnd: () => void): Behaviour.NamedConfiguredBehaviour<any, any> => {
  const shift = Cell<Shift>({ x: 0, y: 0 });
  const isDragging = Cell<boolean>(false);
  const dragBoundaries = Cell<Boundaries>({ x: { min: 0, max: 0 }, y: { min: 0, max: 0 }});
  const lastMousePosition = Cell<Position>({ x: 0, y: 0 });

  const applyStyles = (comp: AlloyComponent): void => {
    applyStylesFor(comp, shift.get(), positionState.get(), isDragging.get());
  };

  const stopDragging = (comp: AlloyComponent): void => {
    isDragging.set(false);
    shift.set({ x: 0, y: 0 });
    const rect = comp.element.dom.getBoundingClientRect();
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    positionState.set(position(rect, viewport, ORIGIN));
    applyStyles(comp);
    // Broadcast the new resting position to every other floating sidebar.
    onDragEnd();
  };

  return AddEventsBehaviour.config('floating-sidebar-drag', [
    // Apply the initial position once the element is in the DOM.
    AlloyEvents.runOnAttached(applyStyles),

    AlloyEvents.run<EventArgs<PointerEvent, HTMLElement>>(NativeEvents.pointerdown(), (comp, se) => {
      const { pointerId, clientX, clientY } = se.event.raw;
      const eventTarget = se.event.target;
      // Only start dragging when the pointer went down on a designated drag handle.
      if (SelectorFind.closest(eventTarget, '[data-mce-floating-sidebar-handle]').isNone()) {
        return;
      }
      isDragging.set(true);
      eventTarget.dom.setPointerCapture(pointerId);
      const mousePosition = { x: Math.round(clientX), y: Math.round(clientY) };
      lastMousePosition.set(mousePosition);
      const draggableRect = comp.element.dom.getBoundingClientRect();
      const allowedOverflowPixels = {
        horizontal: Math.round(draggableRect.width * ALLOWED_OVERFLOW.horizontal),
        vertical: Math.round(draggableRect.height * ALLOWED_OVERFLOW.vertical)
      };
      const constraints = {
        upperLeftCorner: { x: 0, y: 0 },
        bottomRightCorner: { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight }
      };
      dragBoundaries.set(boundaries(draggableRect, mousePosition, constraints, allowedOverflowPixels));
      applyStyles(comp);
    }),

    AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.pointermove(), (comp, se) => {
      const { clientX, clientY } = se.event.raw;
      if (isDragging.get()) {
        se.event.prevent(); // Prevents text selection while dragging on Safari
        const bounds = dragBoundaries.get();
        const currentPointerPosition = {
          x: clamp(Math.round(clientX), bounds.x.min, bounds.x.max),
          y: clamp(Math.round(clientY), bounds.y.min, bounds.y.max)
        };
        const { deltaX, deltaY } = delta(lastMousePosition.get(), currentPointerPosition);
        lastMousePosition.set(currentPointerPosition);
        const currentShift = shift.get();
        shift.set({ x: currentShift.x + deltaX, y: currentShift.y + deltaY });
        applyStyles(comp);
      }
    }),

    AlloyEvents.run<EventArgs<PointerEvent, HTMLElement>>(NativeEvents.pointerup(), (comp, se) => {
      const eventTarget = se.event.target;
      const { pointerId } = se.event.raw;
      eventTarget.dom.releasePointerCapture(pointerId);
      stopDragging(comp);
    }),

    /* This is a workaround for chromium bug where lostPointerCapture event is called, without pointerUp */
    AlloyEvents.run<EventArgs<PointerEvent>>(NativeEvents.lostpointercapture(), (comp) => {
      if (isDragging.get()) {
        stopDragging(comp);
      }
    })
  ]);
};

export { setupSidebarDragging, applyPositionStyles, INITIAL_POSITION };
