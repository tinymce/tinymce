import { Obj } from '@ephox/katamari';
import { Bindable, Event } from './Event';

interface Events<T extends Record<string, Event>> {
  readonly registry: Record<keyof T, Bindable<any>>;
  readonly trigger: Record<keyof T, (...values: any[]) => void>;
}

/** :: {name : Event} -> Events */
const create = function <T extends Record<string, Event>> (typeDefs: T): Events<T> {
  const registry: Record<keyof T, Bindable<any>> = Obj.map(typeDefs, function (event) {
    return {
      bind: event.bind,
      unbind: event.unbind
    };
  });

  const trigger = Obj.map(typeDefs, function (event) {
    return event.trigger;
  });

  return {
    registry,
    trigger
  };
};

export {
  create
};
