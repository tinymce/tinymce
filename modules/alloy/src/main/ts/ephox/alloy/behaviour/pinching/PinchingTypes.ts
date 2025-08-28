import { SugarElement } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { BaseDraggingState } from '../../dragging/common/DraggingTypes';

export interface PinchDragData {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly deltaDistance: number;
}

export interface PinchingBehaviour extends Behaviour.AlloyBehaviour<PinchingConfigSpec, PinchingConfig> {
  readonly config: (config: PinchingConfigSpec) => Behaviour.NamedConfiguredBehaviour<PinchingConfigSpec, PinchingConfig>;
}

export interface PinchingConfig extends Behaviour.BehaviourConfigDetail {
  readonly onPinch: (element: SugarElement<HTMLElement>, changeX: number, changeY: number) => void;
  readonly onPunch: (element: SugarElement<HTMLElement>, changeX: number, changeY: number) => void;
}

export interface PinchingConfigSpec extends Behaviour.BehaviourConfigSpec {
  readonly onPinch: (element: SugarElement<HTMLElement>, changeX: number, changeY: number) => void;
  readonly onPunch: (element: SugarElement<HTMLElement>, changeX: number, changeY: number) => void;
}

export interface PinchingState extends BaseDraggingState<PinchDragData> { }
