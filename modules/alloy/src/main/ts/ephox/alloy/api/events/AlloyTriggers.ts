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

const dispatch = (component: AlloyComponent, target: SugarElement<Node>, event: string): void => {
  dispatchWith(component, target, event, { });
};

const dispatchWith = (component: AlloyComponent, target: SugarElement<Node>, event: string, properties: Record<string, any>): void => {
  // NOTE: The order of spreading here means that it will maintain any target that
  // exists in the current properties. Because this function has been used for situations where
  // properties is either an emulated SugarEvent with no target (see TouchEvent) or
  // for emitting custom events that have no target, this likely hasn't been a problem.
  // But until we verify that nothing is relying on this ordering, there is an alternate
  // function below called retargetAndDispatchWith, which spreads in the other direction.
  const data = {
    target,
    ...properties
  };
  component.getSystem().triggerEvent(event, target, data);
};

const retargetAndDispatchWith = <T extends EventFormat>(component: AlloyComponent, target: SugarElement<Node>, eventName: string, properties: T): void => {
  // This is essentially the same as dispatchWith, except the spreading order
  // means that it clobbers anything in the nativeEvent with "target". It also
  // expects what is being passed in to be a real sugar event, not just a data
  // blob
  const data = {
    ...properties,
    target
  };
  component.getSystem().triggerEvent(eventName, target, data);
};

const dispatchEvent = <T extends EventFormat>(component: AlloyComponent, target: SugarElement<Node>, event: string, simulatedEvent: SimulatedEvent<T>): void => {
  component.getSystem().triggerEvent(event, target, simulatedEvent.event);
};

const dispatchFocus = (component: AlloyComponent, target: SugarElement<HTMLElement>): void => {
  component.getSystem().triggerFocus(target, component.element);
};

export {
  emit,
  emitWith,
  emitExecute,
  dispatch,
  dispatchWith,
  dispatchEvent,
  retargetAndDispatchWith,
  dispatchFocus
};
