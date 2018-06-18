import * as EditableFields from '../alien/EditableFields';
import * as Keys from '../alien/Keys';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as KeyMatch from '../navigation/KeyMatch';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../api/component/ComponentApi';
import { NativeSimulatedEvent, SimulatedEvent } from '../events/SimulatedEvent';
import { SugarElement, SugarEvent } from '../alien/TypeDefinitions';

const doDefaultExecute = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, focused: SugarElement): Option<boolean> => {
  // Note, we use to pass through simulatedEvent here and make target: component. This simplification
  // may be a problem
  AlloyTriggers.dispatch(component, focused, SystemEvents.execute());
  return Option.some(true);
};

const defaultExecute = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, focused: SugarElement): Option<boolean> => {
  return EditableFields.inside(focused) && KeyMatch.inSet(Keys.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
};

export {
  defaultExecute
};