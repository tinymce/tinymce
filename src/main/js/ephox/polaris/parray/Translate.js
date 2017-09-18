define(
  'ephox.polaris.parray.Translate',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun'
  ],

  function (Arr, Merger, Fun) {
    /** Adjust a PositionArray positions by an offset */
    var translate = function (parray, offset) {
      return Arr.map(parray, function (unit) {
        return Merger.merge(unit, {
          start: Fun.constant(unit.start() + offset),
          finish: Fun.constant(unit.finish() + offset)
        });
      });
    };

    return {
      translate: translate
    };
  }
);
