define(
  'ephox.alloy.api.Gui',

  [
    'ephox.alloy.registry.Registry',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (Registry, Arr, Fun, Element, Insert, Remove) {
    var create = function ( ) {
      var container = Element.fromTag('div');
      return takeover(container);

    };

    var takeover = function (container) {
      var registry = Registry();

      var systemApi = { };

      var addToWorld = function (component) {
        registry.register(component);
        component.connect(systemApi);
        Arr.each(component.components(), addToWorld);
      };

      var removeFromWorld = function (component) {
        registry.unregister(component);
        Arr.each(component.components(), removeFromWorld);
      };

      var add = function (component) {
        addToWorld(component);
        Insert.append(container, component.element());
      };

      var remove = function (component) {
        registry.unregister(component);
        Remove.remove(component.element());
      };

      return {
        element: Fun.constant(container),
        add: add,
        remove: remove
      };
    };

    return {
      create: create,
      takeover: takeover
    };
  }
);