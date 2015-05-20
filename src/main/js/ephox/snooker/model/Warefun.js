define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {

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
          cells.push(res);
          current += span;
        }
        return cells;
      };



      for (var i=0; i<structure.length; i++) {
        var rowToAnalise = getRow(structure, i);
        var colToAnalise = getColumn(structure, i);


      }



      var row = extract(getRow(structure, 0), 'rowspan');
      var col = extract(getColumn(structure, 0), 'cellspan');

      console.log('row',row);
      console.log('col',col);








    };

    return {
      render: render
    };
  }
);