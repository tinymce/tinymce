define(
  'ephox.snooker.croc.Bison',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Fun, Option, Struct, Spanning, Util) {

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
              result[newpos] = {
                row: Fun.constant(r),
                column: Fun.constant(start),
                id: cell.id,
                colspan: cell.colspan,
                rowspan: cell.rowspan
              };
            }
          }
        });
      });

      return result;
    };

    var blecker = function (worm, row, rowId, column) {
      /* Generates a list of cells before this column */
      var r = [];
      for (var i = 0; i < column; i++) {
        var position = getId(rowId, i);
        var w = worm[position];
        if (r.length === 0 || r[r.length - 1].id() !== w.id()) {
          if (w.column() + w.colspan() <= column && w.column() !== column && w.column() === i && w.row() === rowId) r.push(w);
        }
      }
      return r;
    };


    var decker = function (worm, row, rowId, column) {
      var r = [];
      for (var i = column + 1; i < 7; i++) {
        var position = getId(rowId, i);
        var w = worm[position];
        if (r.length === 0 || r[r.length - 1].id() !== w.id()) {
          if (w.column() !== column && w.column() === i && w.row() === rowId) r.push(w);
        }
      }
      return r;
      /* Generates a list of cells after this column */
    };

    var max = Struct.immutable('before', 'on', 'after');

    var voom = function (input, c) {
      var worm = stomp(input);

      var result = [];
      Arr.each(input, function (row, r) {
        var position = getId(r, c);
        var cell = worm[position];
        var before = blecker(worm, row, r, c);
        var after = decker(worm, row, r, c);
        if (cell.row() === r) {
          result.push(max(before, Option.some(cell), after));
        } else {
          result.push(max(before, Option.none(), after));
        }
      });

      return result;
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
