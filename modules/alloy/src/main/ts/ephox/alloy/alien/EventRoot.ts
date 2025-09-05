import { Compare } from '@ephox/sugar';

import type { AlloyComponent } from '../api/component/ComponentApi';
import type { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';

const isSource = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>): boolean =>
  Compare.eq(component.element, simulatedEvent.event.target);

export {
  isSource
};
