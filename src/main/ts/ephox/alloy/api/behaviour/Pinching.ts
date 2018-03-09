import * as Behaviour from './Behaviour';
import ActivePinching from '../../behaviour/pinching/ActivePinching';
import PinchingSchema from '../../behaviour/pinching/PinchingSchema';
import * as DragState from '../../dragging/common/DragState';
import { AlloyBehaviour, AlloyBehaviourConfig, SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

export interface PinchingBehaviour extends AlloyBehaviour {
  config: (PinchingConfig) => { key: string, value: any };
}

export interface PinchingConfig extends AlloyBehaviourConfig {
  onPinch: (element: SugarElement, changeX: number, changeY: number) => void;
  onPunch: (element: SugarElement, changeX: number, changeY: number) => void;
}

const Pinching: PinchingBehaviour = Behaviour.create({
  fields: PinchingSchema,
  name: 'pinching',
  active: ActivePinching,
  state: DragState
});

export {
  Pinching
};
