import * as ActiveAllowBubbling from '../../behaviour/allowbubbling/ActiveAllowBubbling';
import AllowBubblingSchema from '../../behaviour/allowbubbling/AllowBubblingSchema';
import { SetupBehaviourCellState } from '../../behaviour/common/BehaviourCellState';
import { AllowBubblingBehavior } from '../../behaviour/allowbubbling/AllowBubblingTypes';
import * as Behaviour from './Behaviour';

const AllowBubbling = Behaviour.create({
  fields: AllowBubblingSchema,
  name: 'allowbubbling',
  active: ActiveAllowBubbling,
  state: SetupBehaviourCellState([])
}) as AllowBubblingBehavior;

export { AllowBubbling };