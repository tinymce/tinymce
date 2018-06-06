import * as Behaviour from './Behaviour';
import * as CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import CouplingState from '../../behaviour/coupling/CouplingState';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface CouplingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: CouplingConfig) => Behaviour.NamedConfiguredBehaviour;
  getCoupled: (component, coupleConfig, coupleState?, name?) => AlloyComponent;
}

export interface CouplingConfig {
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