define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warehouse',
    'ephox.sugar.api.Compare'
  ],

  function (Arr, Fun, Warehouse, Compare) {
    // This needs to a return a list of:
    //
    //   element: TR DOM elements,
    //   cells: List of
    //     colspan: Int,
    //     rowspan: Int,
    //     element: TD/TH DOM element
    var render = function (structure) {
      // var fakeStructure = {
      //   rows: 3,
      //   cols: 3,
      //   grid: [
      //     [ (0,0)cellA, (0,1)cellA, (0,2)cellA ],
      //     [ (1,0)cellB, (1,1)cellC, (1,2)cellC ],
      //     [ (2,0)cellB, (2,1)cellD, (2,2)cellE ]
      //   ]
      // };
      //

      var scanRow = function (row) {
        var cells = [];
        var rows = row.length;
        console.log('scanning row: ', row);
        for (var i = 0; i<rows; i++) {
          var cell = {};
          var rowspan = 1;
          cell.element = row[i];

          // nextCell has to start from the current index plus one,
          // unless the next index is bigger than the size of the row.
          // var nextCell = i+1 (i+1 < rows-1) ? i+1 : i;
          var nextCell = i+1>rows ? -1 : i+1;

          while(nextCell !== -1 && Compare.eq(row[i], row[nextCell])) {

            if (rows-1 >= nextCell) {
              rowspan = rowspan + 1;
              nextCell = nextCell + 1 >= rows ? -1 : nextCell + 1;
            }

            if (row[nextCell] === -1 ) break;

          }


          i = i + rowspan;


          cell.rowspan = rowspan;
          cells.push(cell);
        }
        return cells;
      };



      // var tets = Arr.map(structure.grid, scanRow);
      //

      var getEnd = function (arr, start, val) {
        var end;
        for (var i=start; i<arr.length; i++) {
          if (arr[i]!==val) {
            end = i;
            break;
          }
        }
        return end;
      };

      var getColumn = function (grid, index) {
        return Arr.map(grid, function (row) {
          return row[index];
        });
      };


      var findDiff = function (xs, comp) {
        if (xs.length === 0) return 0;
        var first = xs[0];
        var index = Arr.findIndex(xs, function (x) {
          return !comp(first, x);
        });
        return index === -1 ? xs.length : index;
      };


      var trySomething = function () {
        var x = [1,1,1,2,2,2];

        var cells = [];

        var current = 0;
        while (current < x.length) {
          var slice = x.slice(current);
          var span = findDiff(slice, function (x, y) { return x === y; });

          cells.push({
            element: Fun.constant(x[current]),
            colspan: Fun.constant(span)
          });

          current += span;
        }

        console.log('cells',cells);
        // // start after the start element
        // var i = 0;
        // var res = [];
        // while (i<x.length) {
        //   var val = x[i];
        //   var next = getEnd(x, i, val);
        //   console.log('next', next);
        //   console.log(x.slice(i, next));
        //   i = next;
        // }

        // // var same = x.slice(0, end).length;
        // // console.log('same',same);

      };

      trySomething();


    };

    return {
      render: render
    };
  }
);