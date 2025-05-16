import * as CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import * as CouplingState from '../../behaviour/coupling/CouplingState';
import { CouplingBehaviour } from '../../behaviour/coupling/CouplingTypes';

import * as Behaviour from './Behaviour';

const Coupling: CouplingBehaviour = Behaviour.create({
  fields: CouplingSchema,
  name: 'coupling',
  apis: CouplingApis,
  state: CouplingState
});

export {
  Coupling
};
