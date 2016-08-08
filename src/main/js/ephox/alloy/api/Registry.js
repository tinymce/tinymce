define(
  'ephox.alloy.api.Registry',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.Objects',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.sugar.api.PredicateFind'
  ],

  function (Tagger, Objects, Obj, Fun, PredicateFind) {
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

      var components = { };

      var registerId = function (component, id, events) {
        Obj.each(events, function (v, k) {
          var handlers = registry[k] !== undefined ? registry[k] : { };
          handlers[id] = Fun.curry(v, component);
          registry[k] = handlers;
        });
      };

      var register = function (component) {
        var elem = component.element();
        var tagId = Tagger.write(component.label(), elem);
        var events = component.events();
        registerId(component, tagId, events);
        components[tagId] = component;
      };

      var unregister = function (component) {
        // TODO: Remove events and handlers?
        Tagger.read(component.element()).each(function (tagId) {
          components[tagId] = undefined;
        });
      };

      var findForLabby = function (handlers, elem) {
        return Tagger.read(elem).bind(function (id) {
          var reader = Objects.readOpt(id);
          return handlers.bind(reader).map(function (handler) {
            return eventHandler(elem, handler);
          });
        });
      };

      var filter = function (type) {
        return Objects.readOptFrom(registry, type).map(function (handlers) {
          return Obj.mapToArray(handlers, function (f, id) {
            return messageHandler(id, f);
          });
        }).getOr([ ]);
      };

      var find = function (isRoot, type, target) {
        var readType = Objects.readOpt(type);
        // TODO: Sugar method is inefficient ... .need to write something new which allows me to keep the optional 
        // information, rather than just returning a boolean. Sort of a findMap for Predicate.ancestor.
        var handlers = readType(registry);
        var delegate = PredicateFind.closest(target, function (elem) {
          return findForLabby(handlers, elem).isSome();
        }, isRoot);

        return delegate.bind(function (dlg) {
          return findForLabby(handlers, dlg);
        });
      };

      var getById = function (id) {
        return Objects.readOpt(id)(components);
      };

      return {
        find: find,
        filter: filter,
        register: register,
        unregister: unregister,
        getById: getById
      };
    };
  }
);