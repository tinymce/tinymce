define(
  'ephox.alloy.parts.InternalSink',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (EventHandler, UiSubstitutes, Merger, Fun) {
    return {
      placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.sink>' }),
      build: function (spec) {
        return UiSubstitutes.single(false,  function (detail) {
          return Merger.deepMerge(
            spec,
            {
              uid: detail.uid() + '-internal-sink',
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
            }
          );
        });
      }
    };
  }
);