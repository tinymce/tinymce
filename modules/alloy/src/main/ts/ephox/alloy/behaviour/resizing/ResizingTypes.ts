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

export interface ResizingBehaviour extends Behaviour.AlloyBehaviour<ResizingConfigSpec, ResizingConfig> {
  config: (config: ResizingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ResizingConfigSpec, ResizingConfig>;
  start: (component: AlloyComponent, width: number, height: number, bounds?: ResizeBounds) => void;
  moveBy: (component: AlloyComponent, delta: SugarPosition) => void;
  stop: (component: AlloyComponent) => void;
}

export interface ResizingConfigSpec extends Behaviour.BehaviourConfigSpec {
  resize: (component: AlloyComponent, width: number, height: number) => void;
}

export interface ResizingConfig extends Behaviour.BehaviourConfigDetail {
  resize: (component: AlloyComponent, width: number, height: number) => void;
}

export interface ResizingState extends BehaviourState {
  start: (width: number, height: number, bounds?: ResizeBounds) => void;
  drag: (delta: SugarPosition) => SugarPosition;
  getOriginalWidth: () => number;
  getOriginalHeight: () => number;
  getBounds: () => ResizeBoundsOptional;
}
