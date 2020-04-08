import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as EditableFields from '../alien/EditableFields';
import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import * as KeyMatch from '../navigation/KeyMatch';
import { GeneralKeyingConfig, KeyRuleHandler } from './KeyingModeTypes';

const doDefaultExecute = (
  component: AlloyComponent,
  _simulatedEvent: NativeSimulatedEvent,
  focused: Element
): Option<boolean> => {
  // Note, we use to pass through simulatedEvent here and make target: component. This simplification
  // may be a problem
  AlloyTriggers.dispatch(component, focused, SystemEvents.execute());
  return Option.some<boolean>(true);
};

const defaultExecute = (
  component: AlloyComponent,
  simulatedEvent: NativeSimulatedEvent,
  focused: Element
): Option<boolean> => {
  const isComplex = EditableFields.inside(focused) && KeyMatch.inSet(Keys.SPACE())(simulatedEvent.event());
  return isComplex ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
};

// On Firefox, pressing space fires a click event if the element maintains focus and fires a keyup. This
// stops the keyup, which should stop the click. We might want to make this only work for buttons and Firefox etc,
// but at this stage it's cleaner to just always do it. It makes sense that Keying that handles space should handle
// keyup also. This does make the name confusing, though.
const stopEventForFirefox: KeyRuleHandler<GeneralKeyingConfig, any> = (
  _component: AlloyComponent,
  _simulatedEvent: NativeSimulatedEvent
) => Option.some<boolean>(true);

export {
  defaultExecute,
  stopEventForFirefox
};
