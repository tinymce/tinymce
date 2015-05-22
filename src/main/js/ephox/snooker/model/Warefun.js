define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (Arr, Array) {

    var render = function (structure) {

      var getColumn = function (grid, index) {
        return Arr.map(grid, function (row) {
          return row[index];
        });
      };

      var getRow = function (grid, index) {
        return grid[index];
      };


      var findDiff = function (xs, comp) {
        if (xs.length === 0) return 0;
        var first = xs[0];
        var index = Arr.findIndex(xs, function (x) {
          return !comp(first, x);
        });
        return index === -1 ? xs.length : index;
      };

      var extract = function (line, what) {
        var current = 0;
        var cells = [];
        while (current < line.length) {
          var slice = line.slice(current);
          var span = findDiff(slice, function (x, y) { return x === y; });
          var res = {};
          res[what] = span;
          res.element = line[current];
          cells.push(res);
          current += span;
        }
        return cells;
      };

      var result = [];

      var rows = structure.length;
      var cols = structure[0].length;


      var checkMatrix = new Array(cols);


      for (var m = 0; m<cols; m++) {
        checkMatrix[m] = new Array(rows);
      }


      for (var i=0; i<structure.length; i++) {
        var rowToAnalyse = getRow(structure, i);
        var colToAnalyse = getColumn(structure, i);

        var row = extract(rowToAnalyse, 'colspan');
        var col = extract(colToAnalyse, 'rowspan');

        var currentRow = {};
        currentRow.element = 'tr';
        currentRow.cells = [];

        for (var rowIndex = 0; rowIndex<row.length; rowIndex++) {
          for (var colIndex = i; colIndex<col.length; colIndex++) {
            if (!checkMatrix[rowIndex][colIndex])  currentRow.cells.push({
              element : row[rowIndex].element,
              colspan : row[rowIndex].colspan,
              rowspan : col[colIndex].rowspan
            });

            checkMatrix[rowIndex][colIndex] = true;


          }
        }

        result.push(currentRow);
      }



      return result;






    };

    return {
      render: render
    };
  }
);