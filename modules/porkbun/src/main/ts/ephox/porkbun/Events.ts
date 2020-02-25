import { Obj } from '@ephox/katamari';
import { Event, Bindable } from './Event';

/** :: {name : Event} -> Events */
const create = function (typeDefs: Record<string, Event>) {
  const registry: Record<string, Bindable<any>> = Obj.map(typeDefs, function (event) {
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
