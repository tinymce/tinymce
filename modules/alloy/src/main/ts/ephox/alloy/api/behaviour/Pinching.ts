import * as ActivePinching from '../../behaviour/pinching/ActivePinching';
import PinchingSchema from '../../behaviour/pinching/PinchingSchema';
import { PinchingBehaviour } from '../../behaviour/pinching/PinchingTypes';
import * as DragState from '../../dragging/common/DragState';
import * as Behaviour from './Behaviour';

const Pinching: PinchingBehaviour = Behaviour.create({
  fields: PinchingSchema,
  name: 'pinching',
  active: ActivePinching,
  state: DragState
});

export {
  Pinching
};
