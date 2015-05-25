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
        var row = extract(rowToAnalyse, 'colspan');

        // We get the row here.
        // each row object is made of:
        //    - element,
        //    - colspan


        var currentRow = {};
        currentRow.element = 'tr';
        currentRow.cells = [];

        // Loop through the elements
        // CellIndex represents the position in the row here I am.
        var cellIndex = 0;
        var counter = 0;

        while (cols>cellIndex) {


          var colToAnalyse = getColumn(structure, cellIndex);
          var col = extract(colToAnalyse, 'rowspan');

          var rowIndex = 0;
          while(rows>rowIndex) {
            if (!checkMatrix[cellIndex][rowIndex] && row[counter].element === col[rowIndex].element){

              currentRow.cells.push({
                element: row[counter].element,
                colspan: row[counter].colspan,
                rowspan: col[rowIndex].rowspan
              });
              checkMatrix[cellIndex][rowIndex] = true;
            }

            rowIndex += col[rowIndex].rowspan;
          }


          cellIndex += row[counter].colspan;
          counter++;

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