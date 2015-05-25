test(
  'CapiscoTest',

  [
    'ephox.snooker.model.Capisco'
  ],

  function (Capisco) {
    var check = function (expected, row, column, grid, seen) {
      var actual = Capisco.capisco(row, column, grid, seen);
      assert.eq(expected.rowspan, actual.rowspan);
      assert.eq(expected.colspan, actual.colspan);
      console.log('actual: ', actual);
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