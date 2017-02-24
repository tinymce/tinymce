define(
  'ephox.sugar.api.selection.Selection',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Struct'
  ],

  function (Adt, Struct) {
    // Consider adding a type for "element"
    var type = Adt.generate([
      { domRange: [ 'rng' ] },
      { relative: [ 'startSitu', 'finishSitu' ] },
      { exact: [ 'start', 'soffset', 'finish', 'foffset' ] }
    ]);

    var range = Struct.immutable(
      'start',
      'soffset',
      'finish',
      'foffset'
    );

    var exactFromRange = function (simRange) {
      return type.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
    };

    return {
      domRange: type.domRange,
      relative: type.relative,
      exact: type.exact,

      exactFromRange: exactFromRange,
      range: range
    };
  }
);
