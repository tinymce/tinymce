define(
  'ephox.alloy.parts.InternalSink',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.parts.PartType',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, Positioning, AlloyEvents, NativeEvents, PartType, Fun) {
    var suffix = 'sink';
    var partType = PartType.optional({
      name: suffix,
      overrides: Fun.constant({
        dom: {
          tag: 'div'
        },
        behaviours: Behaviour.derive([
          Positioning.config({
            // TODO: Make an internal sink also be able to be used with relative layouts
            useFixed: true
          })
        ]),
        events: AlloyEvents.derive([
          // Sinks should not let keydown or click propagate
          AlloyEvents.cutter(NativeEvents.keydown()),
          AlloyEvents.cutter(NativeEvents.mousedown()),
          AlloyEvents.cutter(NativeEvents.click())
        ])
      })
    });

    return {
      partType: Fun.constant(partType),
      suffix: Fun.constant(suffix)
    };
  }
);