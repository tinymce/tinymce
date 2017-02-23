define(
  'ephox.alloy.ui.common.ButtonBase',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (SystemEvents, EventHandler, Objects, Arr, Fun) {
    // TODO: Move
    var events = function (optAction) {
      var executeHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          optAction.each(function (action) {
            action(component);
            simulatedEvent.stop();
          });
        }
      });

      var clickHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          var system = component.getSystem();
          simulatedEvent.stop();
          system.triggerEvent(SystemEvents.execute(), component.element(), {
            button: Fun.constant(component),
            target: Fun.constant(component.element())
          });
        }
      });

      // Other mouse down listeners above this one should not get mousedown behaviour (like dragging)
      var mousedownHandler = EventHandler.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.cut();
        }
      });

      return Objects.wrapAll(
        Arr.flatten([
          optAction.isSome() ? [ { key: SystemEvents.execute(), value: executeHandler } ] : [ ],
          [ { key: 'click', value: clickHandler } ],
          [ { key: 'mousedown', value: mousedownHandler } ]
        ])
      );
    };

    return {
      events: events
    };
  }
);