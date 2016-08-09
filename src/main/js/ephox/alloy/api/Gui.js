define(
  'ephox.alloy.api.Gui',

  [
    'ephox.alloy.api.GuiEvents',
    'ephox.alloy.events.Triggers',
    'ephox.alloy.registry.Registry',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (GuiEvents, Triggers, Registry, Arr, Fun, Compare, Element, Insert, Remove) {
    var create = function ( ) {
      var container = Element.fromTag('div');
      return takeover(container);
    };

    var takeover = function (container) {
      var isRoot = Fun.curry(Compare.eq, container);
      
      var registry = Registry();

      var lookup = function (eventName, target) {
        return registry.find(isRoot, eventName, target);
      };

      var domEvents = GuiEvents.setup(container, {
        triggerEvent: function (eventName, event) {
          return Triggers.triggerUntilStopped(lookup, eventName, event);
        }
      });

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

      var destroy = function () {
        // INVESTIGATE: something with registry?
        domEvents.unbind();
      };

      return {
        element: Fun.constant(container),
        destroy: destroy,
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