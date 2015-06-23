test(
  'CellUtilsTest',

  [
    'ephox.snooker.util.CellUtils'
  ],

  function (CellUtils) {
    var eq = function (a, b) {
      return a === b;
    };

    var grid = [
      [ 'a', 'a', 'b' ],
      [ 'c', 'd', 'e' ],
      [ 'f', 'g', 'e' ],
      [ 'h', 'h', 'h' ],
    ];

    var expected = [ 'a', 'e', 'h' ];

    var result = CellUtils.cellSpan(grid, eq);

    assert.eq(expected, result);


  }
);