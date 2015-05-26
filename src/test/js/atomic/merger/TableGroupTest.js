test(
  'TableGroupTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.model.TableGroup'
  ],

  function (Fun, TableGroup) {
    var check = function (expected, row, column, grid) {
      var actual = TableGroup.subGrid(row, column, grid, Fun.tripleEquals);
      assert.eq(expected.rowspan, actual.rowspan);
      assert.eq(expected.colspan, actual.colspan);
    };

    var unused = {};

    var world = [
      [ 'a', 'a', 'a' ],
      [ 'b', 'b', 'c' ],
      [ 'd', 'e', 'c' ]
    ];

    check({ colspan: 3, rowspan: 1 }, 0, 0, world, unused);
    check({ colspan: 2, rowspan: 1 }, 0, 1, world, unused);
    check({ colspan: 2, rowspan: 1 }, 1, 0, world, unused);
    check({ colspan: 1, rowspan: 1 }, 2, 0, world, unused);
  }
);