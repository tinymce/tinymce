define(
  'ephox.snooker.api.ResizeDirection',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Width'
  ],

  function (Arr, Fun, Struct, Height, Location, Width) {
    var colInfo = Struct.immutable('col', 'x');
    var rowInfo = Struct.immutable('row', 'y', 'height');

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

    var heightPositions = function (rows, _table) {

      var lines = Arr.map(rows, function (cellOption, row) {
        return cellOption.map(function (cell) {
          var pos = Location.absolute(cell);
          var height = Height.getOuter(cell);
          // here I can get the height of the row
          return rowInfo(row, pos.top(), height);
        });
      });

      return lines;
    };

    var rtlEdge = function (cell) {
      var pos = Location.absolute(cell);
      return pos.left() + Width.getOuter(cell);
    };

    var ltrEdge = function (cell) {
      return Location.absolute(cell).left();
    };

    var heightEdge = function (cell) {
      return Location.absolute(cell).top() + Width.getOuter(cell);
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

    var height = {
      delta: Fun.identity,
      positions: heightPositions,
      edge: heightEdge
    };

    return {
      ltr: ltr,
      rtl: rtl,
      height: height
    };
  }
);