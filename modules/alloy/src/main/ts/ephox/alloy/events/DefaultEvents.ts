import { console } from '@ephox/dom-globals';
import { Compare, Element } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyEvents from '../api/events/AlloyEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import * as AlloyLogger from '../log/AlloyLogger';
import { FocusingEvent } from './SimulatedEvent';

// The purpose of this check is to ensure that a simulated focus call is not going
// to recurse infinitely. Essentially, if the originator of the focus call is the same
// as the element receiving it, and it wasn't its own target, then stop the focus call
// and log a warning.
const isRecursive = (component: AlloyComponent, originator: Element, target: Element): boolean => Compare.eq(originator, component.element()) &&
    !Compare.eq(originator, target);

const events: AlloyEvents.AlloyEventRecord = AlloyEvents.derive([
  AlloyEvents.can<FocusingEvent>(SystemEvents.focus(), (component, simulatedEvent) => {
    // originator may not always be there. Will need to check this.
    const originator: Element = simulatedEvent.event().originator();
    const target: Element = simulatedEvent.event().target();
    if (isRecursive(component, originator, target)) {
      // tslint:disable-next-line:no-console
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
]);

export {
  events
};
