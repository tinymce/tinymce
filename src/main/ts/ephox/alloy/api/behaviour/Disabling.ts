import Behaviour from './Behaviour';
import ActiveDisable from '../../behaviour/disabling/ActiveDisable';
import DisableApis from '../../behaviour/disabling/DisableApis';
import DisableSchema from '../../behaviour/disabling/DisableSchema';



export default <any> Behaviour.create({
  fields: DisableSchema,
  name: 'disabling',
  active: ActiveDisable,
  apis: DisableApis
});