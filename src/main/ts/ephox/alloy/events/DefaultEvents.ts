import * as AlloyEvents from '../api/events/AlloyEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import * as AlloyLogger from '../log/AlloyLogger';
import { Compare } from '@ephox/sugar';
import { SugarElement } from '../alien/TypeDefinitions';
import { AlloyComponent } from '../api/component/ComponentApi';

// The purpose of this check is to ensure that a simulated focus call is not going
// to recurse infinitely. Essentially, if the originator of the focus call is the same
// as the element receiving it, and it wasn't its own target, then stop the focus call
// and log a warning.
const isRecursive = function (component: AlloyComponent, originator: SugarElement, target: SugarElement) {
  return Compare.eq(originator, component.element()) &&
    !Compare.eq(originator, target);
};

export default <any> {
  events: AlloyEvents.derive([
    AlloyEvents.can(SystemEvents.focus(), function (component, simulatedEvent) {
      // originator may not always be there. Will need to check this.
      const originator = simulatedEvent.event().originator();
      const target = simulatedEvent.event().target();
      if (isRecursive(component, originator, target)) {
        console.warn(
          SystemEvents.focus() + ' did not get interpreted by the desired target. ' +
          '\nOriginator: ' + AlloyLogger.element(originator) +
          '\nTarget: ' + AlloyLogger.element(target) +
          '\nCheck the ' + SystemEvents.focus() + ' event handlers'
        );
        return false;
      } else {
        return true;
      }
    })
  ]) as AlloyEvents.EventHandlerConfigRecord
};