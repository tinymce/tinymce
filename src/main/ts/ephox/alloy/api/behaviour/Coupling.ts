import * as Behaviour from './Behaviour';
import * as CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import CouplingState from '../../behaviour/coupling/CouplingState';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';

export interface CouplingBehaviour extends AlloyBehaviour {
  config: (CouplingConfig) => any;
  getCoupled?: (component, coupleConfig, coupleState?, name?) => any;
}

export interface CouplingConfig<T> extends AlloyBehaviourConfig {
  others: () => any;
}

const Coupling: CouplingBehaviour = Behaviour.create({
  fields: CouplingSchema,
  name: 'coupling',
  apis: CouplingApis,
  state: CouplingState
});

export {
  Coupling
};