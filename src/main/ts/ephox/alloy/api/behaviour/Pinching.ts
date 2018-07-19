import * as Behaviour from './Behaviour';
import * as ActivePinching from '../../behaviour/pinching/ActivePinching';
import PinchingSchema from '../../behaviour/pinching/PinchingSchema';
import * as DragState from '../../dragging/common/DragState';
import { PinchingBehaviour } from '../../behaviour/pinching/PinchingTypes';

const Pinching = Behaviour.create({
  fields: PinchingSchema,
  name: 'pinching',
  active: ActivePinching,
  state: DragState
}) as PinchingBehaviour;

export {
  Pinching
};
