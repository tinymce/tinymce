import { Num, Optional } from '@ephox/katamari';
import type { SugarPosition } from '@ephox/sugar';

import type { AlloyComponent } from '../../api/component/ComponentApi';

import type { ResizeBounds, ResizeSize, ResizingConfig, ResizingState } from './ResizingTypes';

const computeSize = (state: ResizingState): ResizeSize => {
  const accumulatedDelta = state.getAccumulatedDelta();
  const bounds = state.getBounds();
  const width = Num.clamp(Math.round(state.getOriginalWidth() + accumulatedDelta.left), bounds.minWidth.getOr(0), bounds.maxWidth.getOr(Number.MAX_VALUE));
  const height = Num.clamp(Math.round(state.getOriginalHeight() + accumulatedDelta.top), bounds.minHeight.getOr(0), bounds.maxHeight.getOr(Number.MAX_VALUE));
  return { width, height };
};

const start = (_component: AlloyComponent, _config: ResizingConfig, state: ResizingState, width: number, height: number, bounds?: ResizeBounds): void => {
  state.start(width, height, bounds);
};

const moveBy = (_component: AlloyComponent, _config: ResizingConfig, state: ResizingState, delta: SugarPosition): Optional<ResizeSize> => {
  if (!state.isActive()) {
    return Optional.none();
  }

  state.drag(delta);
  return Optional.some(computeSize(state));
};

const stop = (_component: AlloyComponent, _config: ResizingConfig, state: ResizingState): Optional<ResizeSize> => {
  if (!state.isActive()) {
    return Optional.none();
  }

  state.stop();
  return Optional.some(computeSize(state));
};

export {
  start,
  moveBy,
  stop
};
