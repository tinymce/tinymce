import * as Behaviour from './Behaviour';
import * as ActiveToggle from '../../behaviour/toggling/ActiveToggle';
import * as ToggleApis from '../../behaviour/toggling/ToggleApis';
import ToggleSchema from '../../behaviour/toggling/ToggleSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';

const Toggling = Behaviour.create({
  fields: ToggleSchema,
  name: 'toggling',
  active: ActiveToggle,
  apis: ToggleApis
}) as TogglingBehaviour;

export {
  Toggling
};