import { Cell, Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import { nuState } from '../common/BehaviourState';

import type { ResizeBounds, ResizeBoundsOptional, ResizingState } from './ResizingTypes';

const init = (): ResizingState => {
  const originalWidth = Cell(0);
  const originalHeight = Cell(0);
  const accumulatedDelta = Cell<SugarPosition>(SugarPosition(0, 0));
  const bounds = Cell<ResizeBoundsOptional>({
    minWidth: Optional.none(),
    maxWidth: Optional.none(),
    minHeight: Optional.none(),
    maxHeight: Optional.none()
  });

  const start = (width: number, height: number, newBounds: ResizeBounds): void => {
    originalWidth.set(width);
    originalHeight.set(height);
    accumulatedDelta.set(SugarPosition(0, 0));
    bounds.set({
      minWidth: Optional.from(newBounds.minWidth),
      maxWidth: Optional.from(newBounds.maxWidth),
      minHeight: Optional.from(newBounds.minHeight),
      maxHeight: Optional.from(newBounds.maxHeight)
    });
  };

  const drag = (delta: SugarPosition): SugarPosition => {
    const acc = accumulatedDelta.get().translate(delta.left, delta.top);
    accumulatedDelta.set(acc);
    return acc;
  };

  const getOriginalWidth = (): number => originalWidth.get();

  const getOriginalHeight = (): number => originalHeight.get();

  const getBounds = (): ResizeBoundsOptional => bounds.get();

  const readState = (): Record<string, unknown> => ({
    originalWidth: originalWidth.get(),
    originalHeight: originalHeight.get(),
    accumulatedDelta: accumulatedDelta.get(),
    bounds: bounds.get()
  });

  return nuState({
    start,
    drag,
    getOriginalWidth,
    getOriginalHeight,
    getBounds,
    readState
  });
};

export {
  init
};
