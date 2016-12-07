define(
  'ephox.alloy.parts.InternalSink',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (EventHandler, PartType, UiSubstitutes, Merger, Fun) {
    return PartType.optional(
      'sink',
      '<alloy.sink>',
      Fun.constant({ }),
      Fun.constant({
        dom: {
          tag: 'div'
        },
        uiType: 'custom',
        behaviours: {
          positioning: {
            // FIX: configurable
            useFixed: true
          }
        },
        events: {
          // Probably a behaviour: cut mania
          'keydown': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate
              simulatedEvent.cut();
            }
          }),
          'mousedown': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate or mousedown
              simulatedEvent.cut();
            }
          }),
          'click': EventHandler.nu({
            run: function (component, simulatedEvent) {
              // Sinks should not let keydown or click propagate
              simulatedEvent.cut();
            }
          })
        }
      })
    );
  }
);