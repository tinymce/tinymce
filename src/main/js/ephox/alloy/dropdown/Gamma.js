define(
  'ephox.alloy.dropdown.Gamma',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (EventHandler, Merger, Fun, Result, Error) {
    var parts = [
      'display'
    ];

    var display = {
      '<alloy.dropdown.display>': function (dSpec, detail) {
        // Enforce that is has representing behaviour?
        return Merger.deepMerge(detail.parts().display(), {
          uiType: 'custom',
          dom: dSpec.extra.dom,
          components: dSpec.extra.components,
          uid: detail.partUids().display
        });
      }
    };

    var sink  = {
      '<alloy.sink>': function (dSpec, detail) {
        return {
          uid: detail.uid() + '-internal-sink',
          uiType: 'custom',
          dom: dSpec.extra.dom,
          components: dSpec.extra.components,
          positioning: {
            useFixed: true
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
                // Sinks should not let keydown or click propagate
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
        };
      }
    };

    var getSink = function (hotspot, detail) {
      return hotspot.getSystem().getByUid(detail.uid() + '-internal-sink').orThunk(function () {
        return detail.sink().fold(function () {
          return Result.error(new Error(
            'No internal sink is specified, nor an external sink'
          ));
        }, Result.value);
      }).getOrDie();
    };
      
    return {
      parts: Fun.constant(parts),
      display: Fun.constant(display),
      sink: Fun.constant(sink),

      getSink: getSink
    };
  }
);