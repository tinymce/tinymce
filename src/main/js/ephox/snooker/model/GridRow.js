define(
  'ephox.snooker.model.GridRow',

  [
    'ephox.katamari.api.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Structs, Util) {
    var nonNewCells = function (cells) {
      return Arr.map(cells, function(cell, i) {
        return Structs.elementnew(cell, false);
      });
    };
    var addCell = function (gridRow, index, cell) {
      var cells = gridRow.cells();
      var before = nonNewCells(cells.slice(0, index));
      var after = nonNewCells(cells.slice(index));
      var newCells = before.concat([ Structs.elementnew(cell, true) ]).concat(after);
      return setCells(gridRow, newCells);
    };

    var addCells = function (gridRow, index, count, subsitution) {
      var cells = gridRow.cells();
      var newCellz = Util.repeat(count, function () {
        return Structs.elementnew(subsitution(), true);
      });
      var before = nonNewCells(cells.slice(0, index));
      var after = nonNewCells(cells.slice(index));
      var newCells = before.concat( newCellz ).concat(after);
      return setCells(gridRow, newCells);
    };

    var mutateCell = function (gridRow, index, cell) {
      var cells = gridRow.cells();
      cells[index] = cell;
    };

    var setCells = function (gridRow, cells) {
      return Structs.rowcells(cells, gridRow.section());
    };

    var mapCells = function (gridRow, f) {
      var cells = gridRow.cells();
      var r = Arr.map(cells, f);
      return Structs.rowcells(r, gridRow.section());
    };

    var getCell = function (gridRow, index) {
      return gridRow.cells()[index];
    };

    var cellLength = function (gridRow) {
      return gridRow.cells().length;
    };

    return {
      addCell: addCell,
      addCells: addCells,
      setCells: setCells,
      mutateCell: mutateCell,
      getCell: getCell,
      mapCells: mapCells,
      cellLength: cellLength
    };
  }
);
