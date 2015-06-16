define(
  'ephox.snooker.model.Fitment',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    var measure = function (selection, gridA, gridB) {
      if(selection.row() >= gridA.length || selection.column() >= gridA[0].length) throw 'invalid selection out of bounds, do we care about this?';
      var rowRemainder = gridA.slice(selection.row());
      var colRemainder = rowRemainder[0].slice(selection.column());

      var rowRequired = gridB[0].length;
      var colRequired = gridB.length;
      return {
        rowDelta: Fun.constant(rowRemainder.length - rowRequired),
        colDelta: Fun.constant(colRemainder.length - colRequired)
      };
    };

    return {
      measure: measure
    };
  }
);