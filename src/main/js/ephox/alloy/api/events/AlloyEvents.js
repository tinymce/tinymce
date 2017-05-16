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

    var runOnName = function (name) {
      return function (handler) {
        return run(name, handler);
      };
    };

    var runOnSourceName = function (name) {
      return function (handler) {
        return {
          key: name,
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              if (EventRoot.isSource(component, simulatedEvent)) handler(component, simulatedEvent);
            }
          })
        };
      };
    };

    var redirectToUid = function (name, uid) {
      return run(name, function (component, simulatedEvent) {
        component.getSystem().getByUid(uid).each(function (redirectee) {
          redirectee.getSystem().triggerEvent(name, redirectee.element(), simulatedEvent.event());
        });
      });
    };

    return {
      derive: derive,
      run: run,
      runOnAttached: runOnSourceName(SystemEvents.attachedToDom()),
      runOnDetached: runOnSourceName(SystemEvents.detachedFromDom()),
      runOnExecute: runOnName(SystemEvents.execute()),

      redirectToUid: redirectToUid,
      abort: abort
    };
  }
);
