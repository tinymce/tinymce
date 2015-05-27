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

      console.log('cell.element()',cell.element());

      var cellFinishRow = cell.row() + cell.rowspan()-1;
      var cellFinishCol = cell.column() + cell.colspan()-1;
      var cellStartRow = cell.row();
      var cellStartCol = cell.column();

      console.log('cellFinishRow', cellFinishRow, 'check.finishRow()', check.finishRow());
      console.log('cellFinishCol',cellFinishCol, 'check.finishCol()', check.finishCol());
      console.log('cellStartRow',cellStartRow, 'check.startRow()', check.startRow());
      console.log('cellStartCol',cellStartCol, 'check.startCol()', check.startCol());

      console.log('cellStartCol >= check.startCol',cellStartCol >= check.startCol());
      console.log('cellFinishCol <= check.finishCol()',cellFinishCol <= check.finishCol());
      console.log('cellStartRow >= check.startRow()',cellStartRow >= check.startRow());
      console.log('cellFinishCol >= check.finishRow()',cellFinishCol >= check.finishRow());

      console.log('cellStartRow <= check.finishRow()',cellStartRow <= check.finishRow());
      console.log('cellFinishRow <= check.startRow()',cellFinishRow <= check.startRow());
      console.log('cellStartCol <= check.finishCol()',cellStartCol <= check.finishCol());
      console.log('cellFinishCol <= check.startCol()',cellFinishCol <= check.startCol());
      return  cellStartCol >= check.startCol() &&
              cellFinishCol <= check.finishCol() &&
              cellStartRow >= check.startRow() &&
              cellFinishRow >= check.finishRow() &&

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