define(
  'ephox.snooker.api.ResizeDirection',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, Struct, Location, Width) {
    var colInfo = Struct.immutable('col', 'x');

    var ltrPositions = function (cols) {
      var lines = Arr.map(cols.slice(1), function (cell, col) {
        var pos = Location.absolute(cell);
        return colInfo(col, pos.left());
      });

      var lastCol = cols[cols.length - 1];
      var lastX = Location.absolute(lastCol).left() + Width.getOuter(lastCol);
      return lines.concat([ colInfo(cols.length - 1, lastX) ]);
    };

    var rtlPositions = function (cols) {
      return Arr.map(cols, function (cell, col) {
        var pos = Location.absolute(cell);
        return colInfo(col, pos.left());
      });
    };

    var negate = function (step) {
      return -step;
    };

    var ltr = {
      delta: Fun.identity,
      positions: ltrPositions
    };

    var rtl = {
      delta: negate,
      positions: rtlPositions
    };

    return {
      ltr: ltr,
      rtl: rtl
    };
  }
);