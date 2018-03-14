import * as Behaviour from './Behaviour';
import * as CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import CouplingState from '../../behaviour/coupling/CouplingState';

export interface CouplingBehaviour extends Behaviour.AlloyBehaviour {
  config: (CouplingConfig) => { key: string, value: any };
  getCoupled?: (component, coupleConfig, coupleState?, name?) => any;
}

export interface CouplingConfig<T> extends Behaviour.AlloyBehaviourConfig {
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