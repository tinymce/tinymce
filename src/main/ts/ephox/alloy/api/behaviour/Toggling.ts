import * as Behaviour from './Behaviour';
import * as ActiveToggle from '../../behaviour/toggling/ActiveToggle';
import * as ToggleApis from '../../behaviour/toggling/ToggleApis';
import * as TogglingState from '../../behaviour/toggling/TogglingState';
import ToggleSchema from '../../behaviour/toggling/ToggleSchema';
import { TogglingBehaviour } from '../../behaviour/toggling/TogglingTypes';

const Toggling = Behaviour.create({
  fields: ToggleSchema,
  name: 'toggling',
  active: ActiveToggle,
  apis: ToggleApis,
  state: TogglingState
}) as TogglingBehaviour;

export {
  Toggling
};