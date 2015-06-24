test(
  'FitmentTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.test.Fitment',
    'ephox.snooker.test.TableMerge',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Fun, Structs, Fitment, TableMerge, TestGenerator) {
    var generator = TestGenerator;
    var start = Structs.address;
    var measureTest = Fitment.measureTest;
    var tailorTest = Fitment.tailorTest;
    var mergeGridsTest = TableMerge.mergeTest;

    var check = function (test, expected, startAddress, gridA, gridB, generator, comparator) {
      test(expected, startAddress, gridA, gridB, generator, comparator);
    };

    // Simple test data, 4 basic variants of merging:
    // gridB into gridA with different start points
    var gridA = function () {
      return [
        [ 'a', 'b', 'c' ],
        [ 'd', 'e', 'f' ],
        [ 'g', 'h', 'i' ]
      ];
    };

    var gridB = function () {
      return [
        [1, 2],
        [3, 4]
      ];
    };

    // col and row are + meaning gridB fits into gridA, given the starting selection point 'a'
    check(measureTest, {
      rowDelta: 1,
      colDelta: 1
    }, start(0, 0), gridA, gridB, Fun.noop, Fun.noop);

    // col and row are > -1 meaning gridB fits into gridA, given the starting selection point 'e'
    check(measureTest, {
      rowDelta: 0,
      colDelta: 0
    }, start(1, 1), gridA, gridB, Fun.noop, Fun.noop);

    // row is 1 too short col is 1 too short, given the starting selection point 'i'
    check(measureTest, {
      rowDelta: -1,
      colDelta: -1
    }, start(2, 2), gridA, gridB, Fun.noop, Fun.noop);

    // col is 1 too short, given the starting selection point 'c' (need to add another column)
    check(measureTest, {
      rowDelta: 1,
      colDelta: -1
     }, start(0, 2), gridA, gridB, Fun.noop, Fun.noop);

    check(
      tailorTest,
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ], start(0, 0), gridA, {
        rowDelta: Fun.constant(1),
        colDelta: Fun.constant(1)
      }, generator, Fun.noop);

    check(
      tailorTest,
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i']
      ], start(1, 1), gridA, {
        rowDelta: Fun.constant(0),
        colDelta: Fun.constant(0)
      }, generator, Fun.noop);

    check(
      tailorTest,
      [
        ['a',   'b',   'c',   '?_0'],
        ['d',   'e',   'f',   '?_1'],
        ['g',   'h',   'i',   '?_2'],
        ['?_3', '?_4', '?_5', '?_6']
      ], start(2, 2), gridA, {
        rowDelta: Fun.constant(-1),
        colDelta: Fun.constant(-1)
      }, generator, Fun.noop);

    check(
      tailorTest,
      [
        ['a', 'b', 'c', '?_0'],
        ['d', 'e', 'f', '?_1'],
        ['g', 'h', 'i', '?_2']
      ], start(0, 2), gridA, {
        rowDelta: Fun.constant(1),
        colDelta: Fun.constant(-1)
      }, generator, Fun.noop);

    check(
      mergeGridsTest,
      [
        ['h(1)_0', 'h(2)_1', 'c'],
        ['h(3)_2', 'h(4)_3', 'f'],
        ['g', 'h', 'i']
      ], start(0, 0), gridA, gridB, generator, Fun.tripleEquals);

    check(
      mergeGridsTest,
      [
        ['a', 'b', 'c'],
        ['d', 'h(1)_0', 'h(2)_1'],
        ['g', 'h(3)_2', 'h(4)_3']
      ], start(1, 1), gridA, gridB, generator, Fun.tripleEquals);

    check(
      mergeGridsTest,
      [
        ['a',   'b',   'c',        '?_0'],
        ['d',   'e',   'f',        '?_1'],
        ['g',   'h',   'h(1)_0',   'h(2)_1'],
        ['?_3', '?_4', 'h(3)_2',   'h(4)_3']
      ], start(2, 2), gridA, gridB, generator, Fun.tripleEquals);

    check(
      mergeGridsTest,
      [
        ['a', 'b', 'h(1)_0', 'h(2)_1'],
        ['d', 'e', 'h(3)_2', 'h(4)_3'],
        ['g', 'h', 'i', '?_2']
      ], start(0, 2), gridA, gridB, generator, Fun.tripleEquals);

  }
);