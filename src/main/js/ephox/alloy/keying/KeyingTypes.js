import EditableFields from '../alien/EditableFields';
import Keys from '../alien/Keys';
import AlloyTriggers from '../api/events/AlloyTriggers';
import SystemEvents from '../api/events/SystemEvents';
import KeyMatch from '../navigation/KeyMatch';
import { Option } from '@ephox/katamari';

var doDefaultExecute = function (component, simulatedEvent, focused) {
  // Note, we use to pass through simulatedEvent here and make target: component. This simplification
  // may be a problem
  AlloyTriggers.dispatch(component, focused, SystemEvents.execute());
  return Option.some(true);
};

var defaultExecute = function (component, simulatedEvent, focused) {
  return EditableFields.inside(focused) && KeyMatch.inSet(Keys.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
};

export default <any> {
  defaultExecute: defaultExecute
};