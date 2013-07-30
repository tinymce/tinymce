define(
  'ephox.snooker.croc.Bison',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Fun, Option, Spanning, Util) {

    var getId = function (r, c) {
      return r + ',' + c;
    };

    var stomp = function (input) {
      var result = {};
      Arr.each(input, function (row, r) {
        Arr.each(row, function (cell) {
          var start = 0;
          while (result[getId(r, start)] !== undefined) {
            start++;
          }

          for (var i = 0; i < cell.colspan(); i++) {
            for (var j = 0; j < cell.rowspan(); j++) {
              var newpos = getId(r + j, start + i);
              result[newpos] = cell.id();
            }
          }
        });
      });

      return result;
    };

    var voom = function (input, ci) {
      return Arr.map(input, function (row) {
        /*
          Let's just sketch this out.

          Essentially, all the cells above this cell determine whether or not this 
          cell is in the right position. Assume always that the row is correct, it is
          just the column that needs to be determined, and the column is such a fluid
          concept.


        */



        return {
          before: Fun.constant(row.slice(0, ci)),
          on: Fun.constant(Option.some(row[ci])),
          after: Fun.constant(row.slice(ci + 1))
        };
      });
    };

    var split = function (input, ri, ci) {
      var target = input[ri] !== undefined ? input[ri][ci] : Spanning(0,0);
      var colspan = target.colspan();
      var rowspan = target.rowspan();


      return Arr.map(input, function (row, r) {
        return Arr.bind(row, function (cell, c) {
          console.log('ci: ', ci, 'c: ', c, 'ri: ', ri, 'r: ',r);
          if (ri === r && ci === c) {
            // INVESTIGATE: Merging content.
            if (cell.colspan() !== 1) {
              return Util.repeat(cell.colspan(), function () {
                return Spanning(cell.rowspan(), 1);
              });
            } else {
              return [
                Spanning(cell.rowspan(), 1),
                Spanning(cell.rowspan(), 1)
              ]
            }
          } else {
            return [ cell ]
          }
        });
      });
    };

    return {
      voom: voom,
      split: split,
      stomp: stomp
    };
  }
);
