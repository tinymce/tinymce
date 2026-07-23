import type { Optional } from '@ephox/katamari';
import type { SugarPosition } from '@ephox/sugar';

import type * as Behaviour from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { BehaviourState } from '../common/BehaviourState';

export interface ResizeBounds {
  readonly minWidth?: number;
  readonly maxWidth?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

export interface ResizeBoundsOptional {
  readonly minWidth: Optional<number>;
  readonly maxWidth: Optional<number>;
  readonly minHeight: Optional<number>;
  readonly maxHeight: Optional<number>;
}

export interface ResizeSize {
  readonly width: number;
  readonly height: number;
}

export interface ResizingBehaviour extends Behaviour.AlloyBehaviour<ResizingConfigSpec, ResizingConfig> {
  config: (config: ResizingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ResizingConfigSpec, ResizingConfig>;
  start: (component: AlloyComponent, width: number, height: number, bounds?: ResizeBounds) => void;
  moveBy: (component: AlloyComponent, delta: SugarPosition) => Optional<ResizeSize>;
  stop: (component: AlloyComponent) => Optional<ResizeSize>;
}

export interface ResizingConfigSpec extends Behaviour.BehaviourConfigSpec {
}

export interface ResizingConfig extends Behaviour.BehaviourConfigDetail {
}

export interface ResizingState extends BehaviourState {
  start: (width: number, height: number, bounds?: ResizeBounds) => void;
  stop: () => void;
  isActive: () => boolean;
  drag: (delta: SugarPosition) => SugarPosition;
  getAccumulatedDelta: () => SugarPosition;
  getOriginalWidth: () => number;
  getOriginalHeight: () => number;
  getBounds: () => ResizeBoundsOptional;
}
