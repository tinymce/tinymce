import * as ActivePosition from '../../behaviour/positioning/ActivePosition';
import * as PositionApis from '../../behaviour/positioning/PositionApis';
import { PositioningBehaviour } from '../../behaviour/positioning/PositioningTypes';
import { PositionSchema } from '../../behaviour/positioning/PositionSchema';
import * as Behaviour from './Behaviour';

const Positioning: PositioningBehaviour = Behaviour.create({
  fields: PositionSchema,
  name: 'positioning',
  active: ActivePosition,
  apis: PositionApis
});

export {
  Positioning
};
