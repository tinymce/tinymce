import Behaviour from './Behaviour';
import ActiveToggle from '../../behaviour/toggling/ActiveToggle';
import ToggleApis from '../../behaviour/toggling/ToggleApis';
import ToggleSchema from '../../behaviour/toggling/ToggleSchema';

export default <any> Behaviour.create({
  fields: ToggleSchema,
  name: 'toggling',
  active: ActiveToggle,
  apis: ToggleApis
});