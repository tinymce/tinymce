import { Num } from '@ephox/katamari';
import type { SugarPosition } from '@ephox/sugar';

import type { AlloyComponent } from '../../api/component/ComponentApi';

import type { ResizeBounds, ResizingConfig, ResizingState } from './ResizingTypes';

const start = (_component: AlloyComponent, _config: ResizingConfig, state: ResizingState, width: number, height: number, bounds?: ResizeBounds): void => {
  state.start(width, height, bounds);
};

const moveBy = (component: AlloyComponent, config: ResizingConfig, state: ResizingState, delta: SugarPosition): void => {
  if (!state.isActive()) {
    return;
  }

  const accumulatedDelta = state.drag(delta);
  const bounds = state.getBounds();

  const width = Num.clamp(Math.round(state.getOriginalWidth() + accumulatedDelta.left), bounds.minWidth.getOr(0), bounds.maxWidth.getOr(Number.MAX_VALUE));
  const height = Num.clamp(Math.round(state.getOriginalHeight() + accumulatedDelta.top), bounds.minHeight.getOr(0), bounds.maxHeight.getOr(Number.MAX_VALUE));

  config.resize(component, width, height);
};

const stop = (_component: AlloyComponent, _config: ResizingConfig, state: ResizingState): void => {
  state.stop();
};

export {
  start,
  moveBy,
  stop
};
