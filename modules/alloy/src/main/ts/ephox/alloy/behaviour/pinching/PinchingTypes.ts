import { Element } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { DraggingState } from '../../dragging/common/DraggingTypes';

export interface PinchDragData {
  deltaX: () => number;
  deltaY: () => number;
  deltaDistance: () => number;
}

export interface PinchingBehaviour extends Behaviour.AlloyBehaviour<PinchingConfigSpec, PinchingConfig> {
  config: (config: PinchingConfigSpec) => Behaviour.NamedConfiguredBehaviour<PinchingConfigSpec, PinchingConfig>;
}

export interface PinchingConfig extends Behaviour.BehaviourConfigDetail {
  onPinch: (element: Element, changeX: number, changeY: number) => void;
  onPunch: (element: Element, changeX: number, changeY: number) => void;
}

export interface PinchingConfigSpec extends Behaviour.BehaviourConfigSpec {
  onPinch: (element: Element, changeX: number, changeY: number) => void;
  onPunch: (element: Element, changeX: number, changeY: number) => void;
}

export interface PinchingState extends DraggingState<PinchDragData> { }
