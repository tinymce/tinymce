import Behaviour from './Behaviour';
import ActiveFocus from '../../behaviour/focusing/ActiveFocus';
import FocusApis from '../../behaviour/focusing/FocusApis';
import FocusSchema from '../../behaviour/focusing/FocusSchema';



export default <any> Behaviour.create({
  fields: FocusSchema,
  name: 'focusing',
  active: ActiveFocus,
  apis: FocusApis
  // Consider adding isFocused an an extra
});