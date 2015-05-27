define(
  'ephox.snooker.selection.SpanningCells',

  [

  ],

  function () {
    var key = function (row, column) {
      return row + ',' + column;
    };
    var getCell = function (structure, row, col) {
      return structure()[key(row(), col())];
    };

    var isSpanning = function (check) {
      var cell = getCell(check.structure, check.cellRow, check.cellCol);
      var cellFinishRow = cell.row() + cell.rowspan()-1;
      var cellFinishCol = cell.column() + cell.colspan()-1;
      var cellStartRow = cell.row();
      var cellStartCol = cell.column();

      return  cellStartCol >= check.startCol() &&
              cellFinishCol <= check.finishCol() &&
              cellStartRow >= check.startRow() &&
              cellFinishRow <= check.finishRow() &&

              cellStartRow <= check.finishRow() &&
              cellFinishRow >= check.startRow() &&
              cellStartCol <= check.finishCol() &&
              cellFinishCol >= check.startCol();
    };

    return {
      get: getCell,
      isSpanning: isSpanning
    };
  }
);