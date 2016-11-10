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
        // NOT sure what to do here.
        if (detail.lazySink().isSome()) return { uiType: 'container' };
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
        };
      }
    };

    var getSink = function (anyInSystem, detail) {
      return anyInSystem.getSystem().getByUid(detail.uid() + '-internal-sink').map(function (internalSink) {
        return Fun.constant(
          Result.value(internalSink)
        );
      }).getOrThunk(function () {
        return detail.lazySink().fold(function () {
          return Fun.constant(
            Result.error(new Error(
              'No internal sink is specified, nor could an external sink be found'
            ))
          );
        }, Fun.identity);
      });
    };
      
    return {
      parts: Fun.constant(parts),
      display: Fun.constant(display),
      sink: Fun.constant(sink),

      getSink: getSink
    };
  }
);