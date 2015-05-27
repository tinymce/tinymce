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

      // console.log('cellFinishRow', cellFinishRow);
      // console.log('cellFinishCol', cellFinishCol);
      // console.log('cellStartRow ', cellStartRow );
      // console.log('cellStartCol ', cellStartCol );

      // console.log('check.startCol()', check.startCol());
      // console.log('check.finishCol()', check.finishCol());
      // console.log('check.startRow()', check.startRow());
      // console.log('check.finishRow()', check.finishRow());

      // console.log('cellStartCol >= check.startCol()', cellStartCol >= check.startCol());
      // console.log('cellFinishCol <= check.finishCol()', cellFinishCol <= check.finishCol());
      // console.log('cellStartRow >= check.startRow()', cellStartRow >= check.startRow());
      // console.log('cellFinishRow <= check.finishRow()', cellFinishRow <= check.finishRow());



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