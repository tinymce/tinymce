import * as EditableFields from '../alien/EditableFields';
import Keys from '../alien/Keys';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as KeyMatch from '../navigation/KeyMatch';
import { Option } from '@ephox/katamari';

const doDefaultExecute = function (component, simulatedEvent, focused) {
  // Note, we use to pass through simulatedEvent here and make target: component. This simplification
  // may be a problem
  AlloyTriggers.dispatch(component, focused, SystemEvents.execute());
  return Option.some(true);
};

const defaultExecute = function (component, simulatedEvent, focused) {
  return EditableFields.inside(focused) && KeyMatch.inSet(Keys.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
};

export {
  defaultExecute
};