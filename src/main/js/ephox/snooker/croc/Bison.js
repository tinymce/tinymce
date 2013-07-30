define(
  'ephox.snooker.croc.Bison',

  [
    'ephox.compass.Arr',
    'ephox.snooker.croc.Spanning',
    'ephox.snooker.util.Util'
  ],

  function (Arr, Spanning, Util) {

    var split = function (input, ri, ci) {
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
      split: split
    };
  }
);
