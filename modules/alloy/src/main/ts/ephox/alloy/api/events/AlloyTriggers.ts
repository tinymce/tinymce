import { SugarElement } from '@ephox/sugar';

import { EventFormat, SimulatedEvent } from '../../events/SimulatedEvent';
import { AlloyComponent } from '../component/ComponentApi';
import * as SystemEvents from './SystemEvents';

const emit = (component: AlloyComponent, event: string): void => {
  dispatchWith(component, component.element, event, { });
};

const emitWith = (component: AlloyComponent, event: string, properties: Record<string, any>): void => {
  dispatchWith(component, component.element, event, properties);
};

const emitExecute = (component: AlloyComponent): void => {
  emit(component, SystemEvents.execute());
};

const dispatch = (component: AlloyComponent, target: SugarElement, event: string): void => {
  dispatchWith(component, target, event, { });
};

const dispatchWith = (component: AlloyComponent, target: SugarElement, event: string, properties: Record<string, any>): void => {
  const data = {
    target,
    ...properties
  };
  component.getSystem().triggerEvent(event, target, data);
};

const dispatchEvent = <T extends EventFormat>(component: AlloyComponent, target: SugarElement, event: string, simulatedEvent: SimulatedEvent<T>): void => {
  component.getSystem().triggerEvent(event, target, simulatedEvent.event);
};

const dispatchFocus = (component: AlloyComponent, target: SugarElement): void => {
  component.getSystem().triggerFocus(target, component.element);
};

export {
  emit,
  emitWith,
  emitExecute,
  dispatch,
  dispatchWith,
  dispatchEvent,
  dispatchFocus
};
