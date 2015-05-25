test(
  'CapiscoTest',

  [
    'ephox.snooker.model.Capisco'
  ],

  function (Capisco) {
    var check = function (expected, row, column, grid) {
      var actual = Capisco.capisco(row, column, grid);
      assert.eq(expected.rowspan, actual.rowspan);
      assert.eq(expected.colspan, actual.colspan);
      assert.eq(expected.seen, actual.seen);
      console.log('actual: ', actual);
    };

    var unused = {};

    var world = [
      [ 'a', 'a', 'a' ],
      [ 'b', 'b', 'c' ],
      [ 'd', 'e', 'c' ]
    ];

    var t = true;
    var f = false;

    check({ seen: [ [ t, t, t ], [ f, f, f ], [ f, f, f ] ], colspan: 3, rowspan: 1 }, 0, 0, world, unused);
    check({ seen: [ [ f, t, t ], [ f, f, f ], [ f, f, f ] ], colspan: 2, rowspan: 1 }, 0, 1, world, unused);
    check({ seen: [ [ f, f, f ], [ t, t, f ], [ f, f, f ] ], colspan: 2, rowspan: 1 }, 1, 0, world, unused);
    check({ seen: [ [ f, f, f ], [ f, f, f ], [ t, f, f ] ], colspan: 1, rowspan: 1 }, 2, 0, world, unused);
  }
);