test(
  'FitmentTest',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Fitment'
  ],

  function (Structs, Fitment) {

    var start = Structs.address;
    var measureTest = function (expected, startAddress, gridA, gridB) {
      var tux = Fitment.measure(startAddress, gridA, gridB);
      assert.eq(expected.rowDelta, tux.rowDelta(), 'rowDelta expected: ' + expected.rowDelta + ' actual: '+ tux.rowDelta());
      assert.eq(expected.colDelta, tux.colDelta(), 'colDelta expected: ' + expected.colDelta + ' actual: '+ tux.colDelta());
    };

    // merge gridB into gridA
    var gridA = [
      [ 'a', 'b', 'c' ],
      [ 'd', 'e', 'f' ],
      [ 'g', 'h', 'i' ]
    ];

    var gridB = [
      [1, 2],
      [3, 4]
    ];

    measureTest({ rowDelta: 1, colDelta: 1 }, start(0, 0), gridA, gridB);    // col and row are + meaning gridB fits into gridA, given the starting selection point 'a'
    measureTest({ rowDelta: 0, colDelta: 0 }, start(1, 1), gridA, gridB);    // col and row are > -1 meaning gridB fits into gridA, given the starting selection point 'e'
    measureTest({ rowDelta: -1, colDelta: -1 }, start(2, 2), gridA, gridB);  // row is 1 too short col is 1 too short, given the starting selection point 'i'
    measureTest({ rowDelta: 1, colDelta: -1 }, start(0, 2), gridA, gridB);   // col is 1 too short, given the starting selection point 'c' (need to add another column)
    // // check({ rowDelta: null, colDelta: null }, start(3, 3), gridA, gridB); // out of bounds startAddress, do we care?


    var tailorTest = function (expected, startAddress, gridA, gridB) {
      var tux = Fitment.tailor(startAddress, gridA, gridB);
      assert.eq(expected, tux);
    };


    tailorTest(      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ], start(0, 0), gridA, gridB);

    tailorTest(
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ], start(1, 1), gridA, gridB);

    tailorTest(
      [
        ['a', 'b', 'c', '?'],
        ['d', 'e', 'f', '?'],
        ['g', 'h', 'i', '?'],
        ['?', '?', '?', '?']
      ], start(2, 2), gridA, gridB);

    tailorTest([
        ['a', 'b', 'c', '?'],
        ['d', 'e', 'f', '?'],
        ['g', 'h', 'i', '?']
      ], start(0, 2), gridA, gridB);


  }
);