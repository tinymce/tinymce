define(
  'ephox.alloy.api.Gui',

  [
    'ephox.alloy.api.GuiEvents',
    'ephox.alloy.api.SystemApi',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.events.Triggers',
    'ephox.alloy.registry.Registry',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (GuiEvents, SystemApi, SystemEvents, Triggers, Registry, Arr, Fun, Result, Compare, Element, Insert, Remove) {
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

      var systemApi = SystemApi({
        // This is a real system
        debugInfo: Fun.constant('real'),
        triggerEvent: function (customType, target, data) {
          // The return value is not used because this is a fake event.
          Triggers.triggerOnUntilStopped(lookup, customType, data, target);
        },
        triggerFocus: function (target, originator) {
          Triggers.triggerHandler(lookup, SystemEvents.focus(), {
            // originator is used by the default events to ensure that focus doesn't
            // get called infinitely
            originator: Fun.constant(originator),
            target: Fun.constant(target)
          }, target);
        },
        build: Fun.die('no building yet'),
        addToWorld: function (c) { addToWorld(c); }
      });

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

      var broadcastData = function (data) {
        var receivers = registry.filterByType(SystemEvents.receive());
        Arr.each(receivers, function (receiver) {
          receiver.handler(data);
        });
      };

      var broadcast = function (message) {
        broadcastData({
          universal: Fun.constant(true),
          data: Fun.constant(message)
        });
      };

      var broadcastOn = function (channels, message) {
        broadcastData({
          universal: Fun.constant(false),
          channels: Fun.constant(channels),
          data: Fun.constant(message)
        });
      };

      var getByUid = function (uid) {
        return registry.getById(uid).fold(function () {
          return Result.error('Could not find component with uid: "' + uid + '" in system.');
        }, Result.value);
      };

      return {
        element: Fun.constant(container),
        destroy: destroy,
        add: add,
        remove: remove,
        getByUid: getByUid,

        broadcast: broadcast,
        broadcastOn: broadcastOn
      };
    };

    return {
      create: create,
      takeover: takeover
    };
  }
);