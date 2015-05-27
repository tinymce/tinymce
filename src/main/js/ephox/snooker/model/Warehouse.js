define(
  'ephox.snooker.model.Warehouse',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.api.Structs',
    'global!Math'
  ],

  function (Arr, Fun, Option, Structs, Math) {
    var key = function (row, column) {
      return row + ',' + column;
    };

    var getAt = function (warehouse, row, column) {
      var raw = warehouse.access()[key(row, column)];
      return raw !== undefined ? Option.some(raw) : Option.none();
    };

    // Identify extended by the dom position of the cell.
    var domAt = function (warehouse, rowIndex, colIndex) {
      var cells = warehouse.all();
      // Identify the actual DOM position of the cell.
      return Option.from(cells[rowIndex]).bind(function (row) {
        return Option.from(row.cells()[colIndex]);
      });
    };

    var findItem = function (warehouse, item, comparator) {
      var rowData = warehouse.all();
      // There would be a more efficient way of doing this, but we can keep this for the time being.
      var flattened = Arr.flatten(Arr.map(rowData, function (row) { return row.cells(); }));
      var raw = Arr.find(flattened, function (cell) {
        return comparator(item, cell.element());
      });

      return raw !== undefined ? Option.some(raw) : Option.none();
    };

    /*
     * From a list of list of Detail, generate three pieces of information:
     *  1. the grid size
     *  2. a data structure which can efficiently identify which cell is in which row,column position
     *  3. a list of all cells in order left-to-right, top-to-bottom
     */
    var generate = function (list) {
      // list is an array of objects, made by cells and elements
      // elements: is the TR
      // cells: is an array of objects representing the cells in the row.
      //        It is made of:
      //          colspan (merge cell)
      //          element
      //          rowspan (merge cols)
      var access = {};
      var cells = [];

      var maxRows = 0;
      var maxColumns = 0;

      Arr.each(list, function (details, r) {
        var currentRow = [];
        Arr.each(details.cells(), function (detail, c) {
          var start = 0;

          // If this spot has been taken by a previous rowspan, skip it.
          while (access[key(r, start)] !== undefined) {
            start++;
          }

          var current = Structs.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);

          // Occupy all the (row, column) positions that this cell spans for.
          for (var i = 0; i < detail.colspan(); i++) {
            for (var j = 0; j < detail.rowspan(); j++) {
              var cr = r + j;
              var cc = start + i;
              var newpos = key(cr, cc);
              access[newpos] = current;
              maxRows = Math.max(maxRows, cr + 1);
              maxColumns = Math.max(maxColumns, cc + 1);
            }
          }

          currentRow.push(current);
        });

        cells.push(Structs.rowdata(details.element(), currentRow));
      });

      //

      var grid = Structs.grid(maxRows, maxColumns);

      return {
        grid: Fun.constant(grid),
        access: Fun.constant(access),
        all: Fun.constant(cells)
      };
    };

    var justCells = function (warehouse) {
      var rows = Arr.map(warehouse.all(), function (w) {
        return w.cells();
      });

      return Arr.flatten(rows);
    };

    return {
      generate: generate,
      getAt: getAt,
      domAt: domAt,
      findItem: findItem,
      justCells: justCells
    };
  }
);
