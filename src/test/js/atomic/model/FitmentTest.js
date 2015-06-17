test(
  'FitmentTest',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Fitment',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Structs, Fitment, TestGenerator) {
    var generator = TestGenerator;
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


    var tailorTest = function (expected, startAddress, gridA, gridB, generator) {
      var tux = Fitment.tailor(startAddress, gridA, gridB, generator());
      assert.eq(expected, tux);
    };

    tailorTest(
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ], start(0, 0), gridA, gridB, generator);

    tailorTest(
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ], start(1, 1), gridA, gridB, generator);

    tailorTest(
      [
        ['a',   'b',   'c',   '?_0'],
        ['d',   'e',   'f',   '?_1'],
        ['g',   'h',   'i',   '?_2'],
        ['?_3', '?_4', '?_5', '?_6']
      ], start(2, 2), gridA, gridB, generator);

    tailorTest(
      [
        ['a', 'b', 'c', '?_0'],
        ['d', 'e', 'f', '?_1'],
        ['g', 'h', 'i', '?_2']
      ], start(0, 2), gridA, gridB, generator);


    var mergeGridsTest = function (expected, startAddress, gridA, gridB, generator) {
      var nuGrid = Fitment.patch(startAddress, gridA, gridB, generator());
      assert.eq(expected, nuGrid);
    };

    mergeGridsTest(
      [
        ['h(1)_0', 'h(2)_1', 'c'],
        ['h(3)_2', 'h(4)_3', 'f'],

        ['g', 'h', 'i']
      ], start(0, 0), gridA, gridB, generator);

    mergeGridsTest(
      [
        ['a', 'b', 'c'],
        ['d', 'h(1)_0', 'h(2)_1'],
        ['g', 'h(3)_2', 'h(4)_3']
      ], start(1, 1), gridA, gridB, generator);

    mergeGridsTest(
      [
        ['a',   'b',   'c',        '?_0'],
        ['d',   'e',   'f',        '?_1'],
        ['g',   'h',   'h(1)_7',   'h(2)_8'],
        ['?_3', '?_4', 'h(3)_9',   'h(4)_10']
      ], start(2, 2), gridA, gridB, generator);

    mergeGridsTest(
      [
        ['a', 'b', 'h(1)_3', 'h(2)_4'],
        ['d', 'e', 'h(3)_5', 'h(4)_6'],
        ['g', 'h', 'i', '?_2']
      ], start(0, 2), gridA, gridB, generator);

  }
);