import * as Behaviour from './Behaviour';
import * as ActiveReceiving from '../../behaviour/receiving/ActiveReceiving';
import ReceivingSchema from '../../behaviour/receiving/ReceivingSchema';

export interface ReceivingBehaviour extends Behaviour.AlloyBehaviour {
  config: (ReceivingConfig) => { key: string, value: any };
}

export interface ReceivingConfig extends Behaviour.AlloyBehaviourConfig {
  // Intentionally Blank
}

const Receiving: ReceivingBehaviour = Behaviour.create({
  fields: ReceivingSchema,
  name: 'receiving',
  active: ActiveReceiving
});

export {
  Receiving
};