import * as Behaviour from './Behaviour';
import * as CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import * as CouplingState from '../../behaviour/coupling/CouplingState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { CouplingBehaviour } from '../../behaviour/coupling/CouplingTypes';

const Coupling = Behaviour.create({
  fields: CouplingSchema,
  name: 'coupling',
  apis: CouplingApis,
  state: CouplingState
}) as CouplingBehaviour;

export {
  Coupling
};