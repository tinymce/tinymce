import { Fun, Merger, Obj } from '@ephox/katamari';

import * as SystemEvents from './SystemEvents';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { SimulatedEvent } from '../../events/SimulatedEvent';

const emit = function (component: AlloyComponent, event: string): void {
  dispatchWith(component, component.element(), event, { });
};

const emitWith = function (component: AlloyComponent, event: string, properties: {}): void {
  dispatchWith(component, component.element(), event, properties);
};

const emitExecute = function (component: AlloyComponent): void {
  emit(component, SystemEvents.execute());
};

const dispatch = function (component: AlloyComponent, target: SugarElement, event: string): void {
  dispatchWith(component, target, event, { });
};

const dispatchWith = function (component: AlloyComponent, target: SugarElement, event: string, properties: {}): void {
  const data = Merger.deepMerge({
    target
  }, properties);
  component.getSystem().triggerEvent(event, target, Obj.map(data, Fun.constant));
};

const dispatchEvent = function (component: AlloyComponent, target: SugarElement, event: string, simulatedEvent: SimulatedEvent): void {
  component.getSystem().triggerEvent(event, target, simulatedEvent.event());
};

const dispatchFocus = function (component: AlloyComponent, target: SugarElement): void {
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