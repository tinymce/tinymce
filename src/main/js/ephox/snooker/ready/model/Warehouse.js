define(
  'ephox.snooker.ready.model.Warehouse',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.ready.data.Structs',
    'global!Math'
  ],

  function (Arr, Fun, Structs, Math) {
    var key = function (row, column) {
      return row + ',' + column;
    };

    var getAt = function (warehouse, row, column) {
      return warehouse.access()[key(row, column)];
    };

    /* 
     * From a list of list of Detail, generate three pieces of information: 
     *  1. the grid size
     *  2. a data structure which can efficiently identify which cell is in which row,column position
     *  3. a list of all cells in order left-to-right, top-to-bottom
     */
    var generate = function (list) {
      var access = {};
      var cells = [];

      var maxRows = 0;
      var maxColumns = 0;

      Arr.each(list, function (details, r) {
        var currentRow = [];
        Arr.each(details, function (detail, c) {
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

        cells.push(currentRow);
      });

      var grid = Structs.grid(maxRows, maxColumns);

      return {
        grid: Fun.constant(grid),
        access: Fun.constant(access),
        all: Fun.constant(cells)
      };
    };

    return {
      generate: generate,
      getAt: getAt
    };
  }
);
