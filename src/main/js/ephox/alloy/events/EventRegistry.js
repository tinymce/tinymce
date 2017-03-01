define(
  'ephox.alloy.events.EventRegistry',

  [
    'ephox.alloy.alien.TransformFind',
    'ephox.alloy.events.DescribedHandler',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'global!console'
  ],

  function (TransformFind, DescribedHandler, Tagger, Objects, Fun, Obj, Option, Struct, console) {
    var eventHandler = Struct.immutable('element', 'descHandler');

    var messageHandler = function (id, handler) {
      return {
        id: Fun.constant(id),
        descHandler: Fun.constant(handler)
      };
    };

    return function () {
      window.haha = function () {
        return registry;
      };

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
  }
);