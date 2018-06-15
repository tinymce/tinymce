import { Objects } from '@ephox/boulder';
import { Fun, Obj, Option, Struct } from '@ephox/katamari';

import * as TransformFind from '../alien/TransformFind';
import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

const eventHandler = Struct.immutable('element', 'descHandler');

const messageHandler = (id, handler) => {
  return {
    id: Fun.constant(id),
    descHandler: Fun.constant(handler)
  };
};

export default () => {
  const registry = { };

  const registerId = (extraArgs, id, events) => {
    Obj.each(events, (v, k) => {
      const handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    });
  };

  const findHandler = (handlers, elem) => {
    return Tagger.read(elem).fold(() => {
      return Option.none();
    }, (id) => {
      const reader = Objects.readOpt(id);
      return handlers.bind(reader).map((descHandler) => {
        return eventHandler(elem, descHandler);
      });
    });
  };

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type) => {
    return Objects.readOptFrom(registry, type).map((handlers) => {
      return Obj.mapToArray(handlers, (f, id) => {
        return messageHandler(id, f);
      });
    }).getOr([ ]);
  };

  // Given event type, and element, find the handler.
  const find = (isAboveRoot, type, target) => {
    const readType = Objects.readOpt(type);
    const handlers = readType(registry);
    return TransformFind.closest(target, (elem) => {
      return findHandler(handlers, elem);
    }, isAboveRoot);
  };

  const unregisterId = (id) => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, (handlersById, eventName) => {
      if (handlersById.hasOwnProperty(id)) { delete handlersById[id]; }
    });
  };

  return {
    registerId,
    unregisterId,
    filterByType,
    find
  };
};