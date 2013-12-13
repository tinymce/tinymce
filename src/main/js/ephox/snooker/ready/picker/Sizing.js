define(
  'ephox.snooker.ready.picker.Sizing',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.ready.data.Structs',
    'global!Math'
  ],

  function (Fun, Structs, Math) {
    var translate = function (cell, row, column) {
      return Structs.address(cell.row() + row, cell.column() + column);
    };

    var validate = function (cell, minX, maxX, minY, maxY) {
      var row =  Math.max(minY, Math.min(maxY, cell.row()));
      var col = Math.max(minX, Math.min(maxX, cell.column()));
      return Structs.address(row, col);
    };

    /* 
     * Given a (row, column) address of the current mouse, identify the table size 
     * and current selection.
     */
    var resize = function (address, settings) {
      var newSize = translate(address, 1, 1);
      var selection = validate(newSize, 0, settings.maxCols, 0, settings.maxRows);
      var full = validate(translate(selection, 1, 1), settings.minCols, settings.maxCols, settings.minRows, settings.maxRows);
      return {
        selection: Fun.constant(selection),
        full: Fun.constant(full)
      };
    };

    return {
      resize: resize
    };
  }
);
