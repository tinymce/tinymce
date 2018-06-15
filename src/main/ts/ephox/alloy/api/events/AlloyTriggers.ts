import { Fun, Merger, Obj } from '@ephox/katamari';

import * as SystemEvents from './SystemEvents';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { SimulatedEvent, EventFormat } from '../../events/SimulatedEvent';

const emit = (component: AlloyComponent, event: string): void => {
  dispatchWith(component, component.element(), event, { });
};

const emitWith = (component: AlloyComponent, event: string, properties: {}): void => {
  dispatchWith(component, component.element(), event, properties);
};

const emitExecute = (component: AlloyComponent): void => {
  emit(component, SystemEvents.execute());
};

const dispatch = (component: AlloyComponent, target: SugarElement, event: string): void => {
  dispatchWith(component, target, event, { });
};

const dispatchWith = (component: AlloyComponent, target: SugarElement, event: string, properties: {}): void => {
  const data = Merger.deepMerge({
    target
  }, properties);
  component.getSystem().triggerEvent(event, target, Obj.map(data, Fun.constant));
};

const dispatchEvent = function <T extends EventFormat>(component: AlloyComponent, target: SugarElement, event: string, simulatedEvent: SimulatedEvent<T>): void {
  component.getSystem().triggerEvent(event, target, simulatedEvent.event());
};

const dispatchFocus = (component: AlloyComponent, target: SugarElement): void => {
  component.getSystem().triggerFocus(target, component.element());
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