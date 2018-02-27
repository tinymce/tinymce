import { Objects } from '@ephox/boulder';
import { Fun, Obj, Option, Struct } from '@ephox/katamari';

import * as TransformFind from '../alien/TransformFind';
import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';

const eventHandler = Struct.immutable('element', 'descHandler');

const messageHandler = function (id, handler) {
  return {
    id: Fun.constant(id),
    descHandler: Fun.constant(handler)
  };
};

export default <any> function () {
  const registry = { };

  const registerId = function (extraArgs, id, events) {
    Obj.each(events, function (v, k) {
      const handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    });
  };

  const findHandler = function (handlers, elem) {
    return Tagger.read(elem).fold(function (err) {
      return Option.none();
    }, function (id) {
      const reader = Objects.readOpt(id);
      return handlers.bind(reader).map(function (descHandler) {
        return eventHandler(elem, descHandler);
      });
    });
  };

  // Given just the event type, find all handlers regardless of element
  const filterByType = function (type) {
    return Objects.readOptFrom(registry, type).map(function (handlers) {
      return Obj.mapToArray(handlers, function (f, id) {
        return messageHandler(id, f);
      });
    }).getOr([ ]);
  };

  // Given event type, and element, find the handler.
  const find = function (isAboveRoot, type, target) {
    const readType = Objects.readOpt(type);
    const handlers = readType(registry);
    return TransformFind.closest(target, function (elem) {
      return findHandler(handlers, elem);
    }, isAboveRoot);
  };

  const unregisterId = function (id) {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, function (handlersById, eventName) {
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