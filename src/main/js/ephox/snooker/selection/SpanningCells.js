define(
  'ephox.snooker.selection.SpanningCells',

  [

  ],

  function () {
    var getCell = function (structure, row, col) {
      return structure[row][col];
    };

    // 1. Take the position of the cell within the grid
    //    by counting
    var cellPosition = function (structure, row, col) {
      // var rowStart =
    };
    // 'startRow', 'startCol', 'finishRow', 'finishCol', 'cellRow', 'cellCol'
    // A cell is spanning if:
    //  1. Given its position within the grid in terms of row,col,
    //     one of the following conditions is true:
    //     a. check.cellRow() + cell.rowspan() > check.finishRow()
    //     b. check.cellCol() + cell.colspan() > check.finishCol()
    //     c. check.cellRow() - cell.rowspan() < check.startRow()
    //     d. check.cellCol() - cell.colspan() < check.startCol()
    var isSpanning = function (check) {
      var cell = getCell(check.structure(), check.cellRow(), check.cellCol());
      console.log('bounds:', check.startRow(), check.startCol(), ',', check.finishRow(), check.finishCol());

      var cellFinishRow = check.cellRow() + cell.rowspan()-1;
      var cellFinishCol = check.cellCol() + cell.colspan()-1;
      var cellStartRow = check.cellRow() - cell.rowspan()-1;
      var cellStartCol = check.cellCol() - cell.colspan()-1;

      console.log('cellFinishRow',cellFinishRow);
      console.log('cellFinishCol', cellFinishCol);

      return  cellFinishRow > check.finishRow() ||
              cellFinishCol > check.finishCol()||
              cellStartRow < check.startRow()  ||
              cellStartCol < check.startCol();
    };

    return {
      get: getCell,
      isSpanning: isSpanning
    };
  }
);