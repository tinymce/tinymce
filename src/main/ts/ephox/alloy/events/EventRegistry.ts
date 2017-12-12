import TransformFind from '../alien/TransformFind';
import DescribedHandler from './DescribedHandler';
import Tagger from '../registry/Tagger';
import { Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

var eventHandler = Struct.immutable('element', 'descHandler');

var messageHandler = function (id, handler) {
  return {
    id: Fun.constant(id),
    descHandler: Fun.constant(handler)
  };
};

export default <any> function () {
  var registry = { };

  var registerId = function (extraArgs, id, events) {
    Obj.each(events, function (v, k) {
      var handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    });
  };

  var findHandler = function (handlers, elem) {
    return Tagger.read(elem).fold(function (err) {
      return Option.none();
    }, function (id) {
      var reader = Objects.readOpt(id);
      return handlers.bind(reader).map(function (descHandler) {
        return eventHandler(elem, descHandler);
      });
    });
  };

  // Given just the event type, find all handlers regardless of element
  var filterByType = function (type) {
    return Objects.readOptFrom(registry, type).map(function (handlers) {
      return Obj.mapToArray(handlers, function (f, id) {
        return messageHandler(id, f);
      });
    }).getOr([ ]);
  };

  // Given event type, and element, find the handler.
  var find = function (isAboveRoot, type, target) {
    var readType = Objects.readOpt(type);
    var handlers = readType(registry);
    return TransformFind.closest(target, function (elem) {
      return findHandler(handlers, elem);
    }, isAboveRoot);
  };

  var unregisterId = function (id) {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, function (handlersById, eventName) {
      if (handlersById.hasOwnProperty(id)) delete handlersById[id];
    });
  };

  return {
    registerId: registerId,
    unregisterId: unregisterId,
    filterByType: filterByType,
    find: find
  };
};