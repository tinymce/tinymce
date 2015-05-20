define(
  'ephox.snooker.model.Warefun',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.Warehouse',
    'ephox.sugar.api.Compare'
  ],

  function (Fun, Warehouse, Compare) {
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
          var i = 0,
              seq = 0,
              results = [];

          while (i < row.length) {
              var current = row[i],
                  next = row[i + 1];

              if (typeof results[seq] === 'undefined') {
                  results[seq] = [current, 0];
              }

              results[seq][1]++;

              if (current !== next) {
                  seq++;
              }

              i++;
          }

          return results;
      };

      for (var i = 0; i<structure.rows; i++) {

        var rowStruct = scanRow(structure.grid[i]);
        console.log('rowStruct',rowStruct);
      }





    };

    return {
      render: render
    };
  }
);