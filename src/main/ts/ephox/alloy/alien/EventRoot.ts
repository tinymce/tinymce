import { Compare } from '@ephox/sugar';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SimulatedEvent, EventFormat } from '../events/SimulatedEvent';

const isSource = (component: AlloyComponent, simulatedEvent: SimulatedEvent<EventFormat>) => {
  return Compare.eq(component.element(), simulatedEvent.event().target());
};

export {
  isSource
};