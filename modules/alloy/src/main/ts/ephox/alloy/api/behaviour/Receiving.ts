import * as ActiveReceiving from '../../behaviour/receiving/ActiveReceiving';
import ReceivingSchema from '../../behaviour/receiving/ReceivingSchema';
import type { ReceivingBehaviour } from '../../behaviour/receiving/ReceivingTypes';

import * as Behaviour from './Behaviour';

const Receiving: ReceivingBehaviour = Behaviour.create({
  fields: ReceivingSchema,
  name: 'receiving',
  active: ActiveReceiving
});

export {
  Receiving
};
