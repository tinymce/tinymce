define(
  'ephox.alloy.api.events.AlloyEvents',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun'
  ],

  function (EventRoot, SystemEvents, EventHandler, Objects, Fun) {
    var derive = Objects.wrapAll;

    var abort = function (name) {
      return {
        key: name,
        value: EventHandler.nu({
          abort: Fun.constant(true)
        })
      };
    };

    var run = function (name, handler) {
      return {
        key: name,
        value: EventHandler.nu({
          run: handler
        })
      };
    };

    var runOnAttached = function (handler) {
      return {
        key: SystemEvents.attachedToDom(),
        value: EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (EventRoot.isSource(component, simulatedEvent)) handler(component, simulatedEvent);
          }
        })
      };
    };

    var runOnDetached = function (handler) {
      return {
        key: SystemEvents.detachedFromDom(),
        value: EventHandler.nu({
          run: function (component, simulatedEvent) {
            if (EventRoot.isSource(component, simulatedEvent)) handler(component, simulatedEvent);
          }
        })
      };
    };

    return {
      derive: derive,
      run: run,
      runOnAttached: runOnAttached,
      runOnDetached: runOnDetached,
      abort: abort
    };
  }
);
