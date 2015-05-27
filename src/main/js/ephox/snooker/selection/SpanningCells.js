define(
  'ephox.snooker.selection.SpanningCells',

  [

  ],

  function () {
    var key = function (row, column) {
      return row + ',' + column;
    };
    var getCell = function (structure, row, col) {
      return structure[key(row(), col())];
    };

    var isSpanning = function (structure, cellP, check) {
      var cell = getCell(structure, cellP.row, cellP.col);

      var cellFinishRow = cell.row() + cell.rowspan()-1;
      var cellFinishCol = cell.column() + cell.colspan()-1;
      var cellStartRow = cell.row();
      var cellStartCol = cell.column();

      return  cellStartCol >= check.startCol() &&
              cellFinishCol <= check.finishCol() &&
              cellStartRow >= check.startRow() &&
              cellFinishRow <= check.finishRow();
      };

    return {
      get: getCell,
      isSpanning: isSpanning
    };
  }
);