import { EventFormat } from './SimulatedEvent';
import * as AlloyEvents from '../api/events/AlloyEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import * as AlloyLogger from '../log/AlloyLogger';
import { Compare } from '@ephox/sugar';
import { SugarElement } from '../alien/TypeDefinitions';
import { AlloyComponent } from '../api/component/ComponentApi';
import { console } from '@ephox/dom-globals';

// The purpose of this check is to ensure that a simulated focus call is not going
// to recurse infinitely. Essentially, if the originator of the focus call is the same
// as the element receiving it, and it wasn't its own target, then stop the focus call
// and log a warning.
const isRecursive = (component: AlloyComponent, originator: SugarElement, target: SugarElement): boolean => {
  return Compare.eq(originator, component.element()) &&
    !Compare.eq(originator, target);
};

export default {
  events: AlloyEvents.derive([
    AlloyEvents.can(SystemEvents.focus(), (component, simulatedEvent) => {
      // originator may not always be there. Will need to check this.
      const originator: SugarElement = simulatedEvent.event().originator();
      const target: SugarElement = simulatedEvent.event().target();
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
  ]) as AlloyEvents.AlloyEventRecord
};