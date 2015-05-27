define(
  'ephox.snooker.selection.SpanningCells',

  [

  ],

  function () {
    var getCell = function (structure, row, col) {
      var cellRow = structure()[row()];
      var cell = cellRow.cells()[col()];
      return cell;
    };

    var isSpanning = function (check) {
      var cell = getCell(check.structure, check.cellRow, check.cellCol);

      var cellFinishRow = cell.row() + cell.rowspan()-1;
      var cellFinishCol = cell.column() + cell.colspan()-1;
      var cellStartRow = cell.row();
      var cellStartCol = cell.column();

      console.log('cellFinishRow', cellFinishRow, 'check.finishRow()', check.finishRow());
      console.log('cellFinishCol',cellFinishCol, 'check.finishCol()', check.finishCol());
      console.log('cellStartRow',cellStartRow, 'check.startRow()', check.startRow());
      console.log('cellStartCol',cellStartCol, 'check.startCol()', check.startCol());

      console.log('cellStartCol >= check.startCol',cellStartCol >= check.startCol);
      console.log('cellFinishCol <= check.finishCol()',cellFinishCol <= check.finishCol());
      console.log('cellStartRow >= check.startRow()',cellStartRow >= check.startRow());
      console.log('cellFinishCol >= check.finishRow()',cellFinishCol >= check.finishRow());
      return  cellStartCol >= check.startCol() &&
              cellFinishCol <= check.finishCol() &&
              cellStartRow >= check.startRow() &&
              cellFinishCol >= check.finishRow();















    };

    return {
      get: getCell,
      isSpanning: isSpanning
    };
  }
);