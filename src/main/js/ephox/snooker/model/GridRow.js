define(
  'ephox.snooker.model.GridRow',

  [
    'ephox.katamari.api.Arr',
    'ephox.snooker.api.Structs',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Structs, Util) {
    var addCell = function (gridRow, index, cell) {
      var cells = gridRow.cells();
      var newCells = cells.slice(0, index).concat([ cell ]).concat(cells.slice(index));
      return setCells(gridRow, newCells);
    };

    var addCells = function (gridRow, index, count, subsitution) {
      var cells = gridRow.cells();
      var newCellz = Util.repeat(count, function () {
        return subsitution();
      });
      var newCells = cells.slice(0, index).concat( newCellz ).concat(cells.slice(index));
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
