define(
  'ephox.alloy.api.Gui',

  [
    'ephox.alloy.api.GuiEvents',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.SystemApi',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.events.Triggers',
    'ephox.alloy.registry.Registry',
    'ephox.alloy.registry.Tagger',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse',
    'global!Error'
  ],

  function (GuiEvents, GuiFactory, SystemApi, SystemEvents, Container, Triggers, Registry, Tagger, Arr, Fun, Result, Compare, Focus, Insert, Node, Remove, Traverse, Error) {
    var create = function ( ) {
      var root = GuiFactory.build(
        Container.build()
      );
      return takeover(root);
    };

    var takeover = function (root) {
      var isAboveRoot = function (el) {
        return Traverse.parent(root.element()).fold(
          function () {
            return true;
          }, function (parent) {
            return Compare.eq(el, parent);
          }
        );
      };

      var registry = Registry();

      var lookup = function (eventName, target) {
        return registry.find(isAboveRoot, eventName, target);
      };

      var domEvents = GuiEvents.setup(root.element(), {
        triggerEvent: function (eventName, event) {
          return Triggers.triggerUntilStopped(lookup, eventName, event);
        },

        // This doesn't follow usual DOM bubbling. It will just dispatch on all
        // targets that have the event. It is the general case of the more specialised
        // "message". "messages" may actually just go away. This is used for things 
        // like window scroll.
        broadcastEvent: function (eventName, event) {
          var listeners = registry.filter(eventName);
          return Triggers.broadcast(listeners, event);
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
          Tagger.read(target).fold(function () {
            // When the target is not within the alloy system, dispatch a normal focus event.
            Focus.focus(target);
          }, function (_alloyId) {
            Triggers.triggerHandler(lookup, SystemEvents.focus(), {
              // originator is used by the default events to ensure that focus doesn't
              // get called infinitely
              originator: Fun.constant(originator),
              target: Fun.constant(target)
            }, target);
          });
        },

        triggerEscape: function (comp, simulatedEvent) {
          systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
        },

        getByUid: function (uid) {
          return getByUid(uid);
        },
        getByDom: function (elem) {
          return Tagger.read(elem).bind(getByUid);
        },
        build: GuiFactory.build,
        addToGui: function (c) { add(c); },
        removeFromGui: function (c) { remove(c); },
        addToWorld: function (c) { addToWorld(c); },
        removeFromWorld: function (c) { removeFromWorld(c); },
        broadcast: function (message) {
          broadcast(message);
        },
        broadcastOn: function (channels, message) {
          broadcastOn(channels, message);
        }
      });

      var addToWorld = function (component) {
        if (! Node.isText(component.element())) {
          registry.register(component);
          component.connect(systemApi);
          Arr.each(component.components(), addToWorld);
          systemApi.triggerEvent(SystemEvents.systemInit(), component.element(), { target: Fun.constant( component.element() ) });
        }
      };

      var removeFromWorld = function (component) {
        if (! Node.isText(component.element())) {
          Arr.each(component.components(), removeFromWorld);
          // Hmm... wonder if I should disconnect here.
          registry.unregister(component);
        }
      };

      var add = function (component) {
        addToWorld(component);
        Insert.append(root.element(), component.element());
      };

      var remove = function (component) {
        registry.unregister(component);
        component.disconnect();
        Remove.remove(component.element());
      };

      var destroy = function () {
        // INVESTIGATE: something with registry?
        domEvents.unbind();
        Remove.remove(root.element());
      };

      var broadcastData = function (data) {
        var receivers = registry.filter(SystemEvents.receive());
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
          return Result.error(
            new Error('Could not find component with uid: "' + uid + '" in system.')
          );
        }, Result.value);
      };

      addToWorld(root);

      return {
        element: root.element,
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