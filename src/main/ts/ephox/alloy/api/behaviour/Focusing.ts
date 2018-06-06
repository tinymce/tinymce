import * as Behaviour from './Behaviour';
import * as ActiveFocus from '../../behaviour/focusing/ActiveFocus';
import * as FocusApis from '../../behaviour/focusing/FocusApis';
import FocusSchema from '../../behaviour/focusing/FocusSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { FocusingBehaviour } from 'ephox/alloy/behaviour/focusing/FocusingTypes';

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