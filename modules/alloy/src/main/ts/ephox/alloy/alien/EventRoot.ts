import { Compare } from '@ephox/sugar';
import { AlloyComponent } from '../api/component/ComponentApi';
import { SimulatedEvent, EventFormat } from '../events/SimulatedEvent';

const isSource = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => Compare.eq(component.element(), simulatedEvent.event().target());

export {
  isSource
};