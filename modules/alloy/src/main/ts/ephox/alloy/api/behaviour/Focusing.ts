import * as ActiveFocus from '../../behaviour/focusing/ActiveFocus';
import * as FocusApis from '../../behaviour/focusing/FocusApis';
import { FocusingBehaviour } from '../../behaviour/focusing/FocusingTypes';
import FocusSchema from '../../behaviour/focusing/FocusSchema';
import * as Behaviour from './Behaviour';

const Focusing = Behaviour.create({
  fields: FocusSchema,
  name: 'focusing',
  active: ActiveFocus,
  apis: FocusApis
  // Consider adding isFocused an an extra
}) as FocusingBehaviour;

export {
  Focusing
};