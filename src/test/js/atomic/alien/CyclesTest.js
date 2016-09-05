test(
  'CyclesTest',

  [
    'ephox.alloy.alien.Cycles',
    'ephox.wrap.Jsc'
  ],

  function (Cycles, Jsc) {
    Jsc.property(
      'CycleBy should have an adjustment of delta, or be the min or max',
      Jsc.nat,
      Jsc.integer,
      Jsc.nat,
      Jsc.nat,
      function (value, delta, min, range) {
        var max = min + range;
        var actual = Cycles.cycleBy(value, delta, min, max);
        return Jsc.eq((actual - value) === delta, true) || actual === min || actual === max;
      }
    );
  }
);