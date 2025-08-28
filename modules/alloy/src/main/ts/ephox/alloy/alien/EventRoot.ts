import { Compare } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';

const isSource = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>): boolean =>
  Compare.eq(component.element, simulatedEvent.event.target);

export {
  isSource
};
