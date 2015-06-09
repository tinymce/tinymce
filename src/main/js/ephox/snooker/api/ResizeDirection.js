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

    var ltrPositions = function (cols, _table) {
      var lines = Arr.map(cols.slice(1), function (cellOption, col) {
        return cellOption.map(function (cell) {
          var pos = Location.absolute(cell);
          return colInfo(col, pos.left());
        });
      });

      var lastLine = cols[cols.length - 1].map(function (lastCol) {
        var lastX = Location.absolute(lastCol).left() + Width.getOuter(lastCol);
        return colInfo(cols.length - 1, lastX);
      });
      
      return lines.concat([ lastLine ]);
    };

    var rtlPositions = function (cols, _table) {
      var lines = Arr.map(cols.slice(1), function (cellOption, col) {
        return cellOption.map(function (cell) {
          console.log('cell: ', cell.dom(), col);
          var pos = Location.absolute(cell);
          return colInfo(col, pos.left() + Width.getOuter(cell));
        });
      });

      var lastLine = cols[cols.length - 1].map(function (lastCol) {
        var lastX = Location.absolute(lastCol).left();
        return colInfo(cols.length - 1, lastX);
      });

      return lines.concat([ lastLine ]);
    };

    var rtlEdge = function (cell) {
      var pos = Location.absolute(cell);
      return pos.left() + Width.getOuter(cell);
    };

    var ltrEdge = function (cell) {
      return Location.absolute(cell).left();
    };

    var negate = function (step, _table) {
      return -step;
    };

    var ltr = {
      delta: Fun.identity,
      edge: ltrEdge,
      positions: ltrPositions
    };

    var rtl = {
      delta: negate,
      edge: rtlEdge,
      positions: rtlPositions
    };

    return {
      ltr: ltr,
      rtl: rtl
    };
  }
);