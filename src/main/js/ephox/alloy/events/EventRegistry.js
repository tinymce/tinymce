define(
  'ephox.alloy.events.EventRegistry',

  [
    'ephox.alloy.alien.TransformFind',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.PredicateFind',
    'global!console'
  ],

  function (TransformFind, Tagger, Objects, Obj, Merger, Fun, PredicateFind, console) {
    var eventHandler = function (element, handler) {
      return {
        element: Fun.constant(element),
        handler: handler
      };
    };

    var messageHandler = function (id, handler) {
      return {
        id: Fun.constant(id),
        handler: handler
      };
    };

    return function () {
      var registry = { };

      var registerId = function (extraArgs, id, events) {
        Obj.each(events, function (v, k) {
          var handlers = registry[k] !== undefined ? registry[k] : { };
          handlers[id] = Fun.curry.apply(undefined, [ v ].concat(extraArgs));
          registry[k] = handlers;
        });
      };

      var findHandler = function (handlers, elem) {
        return Tagger.read(elem).bind(function (id) {
          var reader = Objects.readOpt(id);
          return handlers.bind(reader).map(function (handler) {
            return eventHandler(elem, handler);
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
      var find = function (isRoot, type, target) {
        var readType = Objects.readOpt(type);
        var handlers = readType(registry);
        return TransformFind.closest(target, function (elem) {
          return findHandler(handlers, elem);
        }, isRoot);
      };

      var unregisterId = function (id) {
        // Hmm ... mutation
        Obj.each(registry, function (handlersById, eventName) {
          if (handlersById.hasOwnProperty(id)) delete handlersById[id];
        });
      };

      setInterval(function () {
        console.log('registry', registry);
      }, 10000);

      return {
        registerId: registerId,
        unregisterId: unregisterId,
        filterByType: filterByType,
        find: find
      };
    };
  }
);