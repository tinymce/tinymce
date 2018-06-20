
import * as Behaviour from '../../api/behaviour/Behaviour';
import { SugarElement } from '../../alien/TypeDefinitions';
import { DraggingState } from '../../dragging/common/DraggingTypes';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';

export interface PinchDragData {
  deltaX: () => number;
  deltaY: () => number;
  deltaDistance: () => number;
}

export interface PinchingBehaviour extends Behaviour.AlloyBehaviour<PinchingConfigSpec, PinchingConfig> {
  config: (config: PinchingConfigSpec) => Behaviour.NamedConfiguredBehaviour<PinchingConfigSpec, PinchingConfig>;
}

export interface PinchingConfig extends BehaviourConfigDetail {
  onPinch: () => (element: SugarElement, changeX: number, changeY: number) => void;
  onPunch: () => (element: SugarElement, changeX: number, changeY: number) => void;
}

export interface PinchingConfigSpec extends BehaviourConfigSpec {
  onPinch: (element: SugarElement, changeX: number, changeY: number) => void;
  onPunch: (element: SugarElement, changeX: number, changeY: number) => void;
}

export interface PinchingState extends DraggingState<PinchDragData> { }