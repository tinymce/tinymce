import * as Behaviour from './Behaviour';
import * as ActiveToggle from '../../behaviour/toggling/ActiveToggle';
import * as ToggleApis from '../../behaviour/toggling/ToggleApis';
import { SetupBehaviourCellState } from '../../behaviour/common/BehaviourCellState';
import ToggleSchema from '../../behaviour/toggling/ToggleSchema';
import { TogglingBehaviour } from '../../behaviour/toggling/TogglingTypes';

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
