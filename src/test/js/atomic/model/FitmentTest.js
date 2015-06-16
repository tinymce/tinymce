test(
  'FitmentTest',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Fitment'
  ],

  function (Structs, Fitment) {

    var sel = Structs.address
    var check = function (expected, selection, gridA, gridB) {
      var tux = Fitment.measure(selection, gridA, gridB);
      assert.eq(expected.rowDelta, tux.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ tux.rowDelta());
      assert.eq(expected.colDelta, tux.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ tux.colDelta());
    };

    // merge gridB goes into gridA
    var gridA = [
      [ 'a', 'b', 'c' ],
      [ 'd', 'e', 'f' ],
      [ 'g', 'h', 'i' ]
    ];

    var gridB = [
      [1, 2],
      [3, 4]
    ];

    check({ rowDelta: 1, colDelta: 1 }, sel(0, 0), gridA, gridB);    // col and row are + meaning gridB fits into gridA, given the starting selection point
    check({ rowDelta: 0, colDelta: 0 }, sel(1, 1), gridA, gridB);    // col and row are > -1 meaning gridB fits into gridA, given the starting selection point
    check({ rowDelta: -1, colDelta: -1 }, sel(2, 2), gridA, gridB);  // row is 1 too short col is 1 too short
    check({ rowDelta: 1, colDelta: -1 }, sel(0, 2), gridA, gridB);   // col is 1 too short
    // check({ rowDelta: 1, colDelta: -1 }, sel(3, 3), gridA, gridB);

  }
);