import * as Behaviour from './Behaviour';
import * as ActivePosition from '../../behaviour/positioning/ActivePosition';
import * as PositionApis from '../../behaviour/positioning/PositionApis';
import PositionSchema from '../../behaviour/positioning/PositionSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { PositioningBehaviour } from 'ephox/alloy/behaviour/positioning/PositioningTypes';

const Positioning = Behaviour.create({
  fields: PositionSchema,
  name: 'positioning',
  active: ActivePosition,
  apis: PositionApis
}) as PositioningBehaviour;

export {
  Positioning
};