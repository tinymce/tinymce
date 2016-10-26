define(
  'ephox.alloy.dropdown.Gamma',

  [
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (Merger, Fun, Result, Error) {
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