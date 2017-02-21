define(
  'ephox.sugar.api.selection.Selection',

  [
    'ephox.katamari.api.Struct'
  ],

  function (Struct) {
    var exact = Struct.immutable('start', 'soffset', 'finish', 'foffset');
    var relative = Struct.immutable('startSitu', 'finishSitu');


    return {
      exact: exact,
      relative: relative
    };
  }
);
