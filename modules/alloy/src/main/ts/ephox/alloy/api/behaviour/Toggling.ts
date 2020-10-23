import { SetupBehaviourCellState } from '../../behaviour/common/BehaviourCellState';
import * as ActiveToggle from '../../behaviour/toggling/ActiveToggle';
import * as ToggleApis from '../../behaviour/toggling/ToggleApis';
import ToggleSchema from '../../behaviour/toggling/ToggleSchema';
import { TogglingBehaviour } from '../../behaviour/toggling/TogglingTypes';
import * as Behaviour from './Behaviour';

const Toggling: TogglingBehaviour = Behaviour.create({
  fields: ToggleSchema,
  name: 'toggling',
  active: ActiveToggle,
  apis: ToggleApis,
  state: SetupBehaviourCellState(false)
});

export {
  Toggling
};
