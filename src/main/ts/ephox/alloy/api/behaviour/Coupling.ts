import Behaviour from './Behaviour';
import CouplingApis from '../../behaviour/coupling/CouplingApis';
import CouplingSchema from '../../behaviour/coupling/CouplingSchema';
import CouplingState from '../../behaviour/coupling/CouplingState';

export default <any> Behaviour.create({
  fields: CouplingSchema,
  name: 'coupling',
  apis: CouplingApis,
  state: CouplingState
});