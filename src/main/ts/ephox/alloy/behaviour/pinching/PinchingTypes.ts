
import * as Behaviour from '../../api/behaviour/Behaviour';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { DraggingState } from 'ephox/alloy/dragging/common/DraggingTypes';

export interface PinchDragData {
  deltaX: () => number;
  deltaY: () => number;
  deltaDistance: () => number;
}

export interface PinchingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: PinchingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
}

export interface PinchingConfig {
  onPinch: () => (element: SugarElement, changeX: number, changeY: number) => void;
  onPunch: () => (element: SugarElement, changeX: number, changeY: number) => void;
}

export interface PinchingConfigSpec {
  onPinch: (element: SugarElement, changeX: number, changeY: number) => void;
  onPunch: (element: SugarElement, changeX: number, changeY: number) => void;
}

export interface PinchingState extends DraggingState<PinchDragData> { }