import * as Behaviour from './Behaviour';
import * as ActiveReceiving from '../../behaviour/receiving/ActiveReceiving';
import ReceivingSchema from '../../behaviour/receiving/ReceivingSchema';
import { ReceivingBehaviour } from '../../behaviour/receiving/ReceivingTypes';

const Receiving = Behaviour.create({
  fields: ReceivingSchema,
  name: 'receiving',
  active: ActiveReceiving
}) as ReceivingBehaviour;

export {
  Receiving
};