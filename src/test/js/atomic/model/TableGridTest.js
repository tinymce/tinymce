test(
  'TableGrid.subgrid test',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.TableGrid'
  ],

  function (Fun, Structs, TableGrid) {
    var r = Structs.rowcells;

    var check = function (expected, row, column, grid) {
      var actual = TableGrid.subgrid(grid, row, column, Fun.tripleEquals);
      assert.eq(expected.rowspan, actual.rowspan());
      assert.eq(expected.colspan, actual.colspan());
    };

    var world = [
      r([ 'a', 'a', 'a' ], 'tbody'),
      r([ 'b', 'b', 'c' ], 'tbody'),
      r([ 'd', 'e', 'c' ], 'tbody')
    ];

    check({ colspan: 3, rowspan: 1 }, 0, 0, world);
    check({ colspan: 2, rowspan: 1 }, 0, 1, world);
    check({ colspan: 2, rowspan: 1 }, 1, 0, world);
    check({ colspan: 1, rowspan: 1 }, 2, 0, world);
  }
);