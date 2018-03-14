import * as Behaviour from './Behaviour';
import * as CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import CouplingState from '../../behaviour/coupling/CouplingState';

export interface CouplingBehaviour extends Behaviour.AlloyBehaviour {
  config: <T>(config: CouplingConfig<T>) => { [key: string]: (any) => any };
  getCoupled: (component, coupleConfig, coupleState?, name?) => any;
}

export interface CouplingConfig<T> {
  others: { [key: string]: (any) => any };
}

const Coupling = Behaviour.create({
  fields: CouplingSchema,
  name: 'coupling',
  apis: CouplingApis,
  state: CouplingState
}) as CouplingBehaviour;

export {
  Coupling
};