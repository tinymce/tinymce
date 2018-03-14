import * as Behaviour from './Behaviour';
import * as ActiveReceiving from '../../behaviour/receiving/ActiveReceiving';
import ReceivingSchema from '../../behaviour/receiving/ReceivingSchema';

export interface ReceivingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ReceivingConfig) => { [key: string]: (any) => any };
}

export interface ReceivingConfig extends Behaviour.AlloyBehaviourConfig {
  // Intentionally Blank
}

const Receiving = Behaviour.create({
  fields: ReceivingSchema,
  name: 'receiving',
  active: ActiveReceiving
}) as ReceivingBehaviour;

export {
  Receiving
};