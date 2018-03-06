import * as Behaviour from './Behaviour';
import * as ActiveReceiving from '../../behaviour/receiving/ActiveReceiving';
import ReceivingSchema from '../../behaviour/receiving/ReceivingSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';

export interface ReceivingBehaviour extends AlloyBehaviour {
  config: (ReceivingConfig) => { key: string, value: any };
}

export interface ReceivingConfig extends AlloyBehaviourConfig {
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