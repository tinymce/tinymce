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
    var suite = TableMerge.suite;

    var check = function (test, expected, startAddress, gridA, gridB, generator, comparator) {
      test(expected, startAddress, gridA, gridB, generator, comparator);
    };

    // Simple test data, 4 basic variants of merging:
    // gridB into gridA with different start points
    var gridA = [
      [ 'a', 'b', 'c' ],
      [ 'd', 'e', 'f' ],
      [ 'g', 'h', 'i' ]
    ];

    var gridB = [
      [1, 2],
      [3, 4]
    ];

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
        ['g',   'h',   'h(1)_7',   'h(2)_8'],
        ['?_3', '?_4', 'h(3)_9',   'h(4)_10']
      ], start(2, 2), gridA, gridB, generator, Fun.tripleEquals);

    check(
      mergeGridsTest,
      [
        ['a', 'b', 'h(1)_3', 'h(2)_4'],
        ['d', 'e', 'h(3)_5', 'h(4)_6'],
        ['g', 'h', 'i', '?_2']
      ], start(0, 2), gridA, gridB, generator, Fun.tripleEquals);



    // START interesting cases, these are suites they combine all 3 tests in 1 spec
    // merge gridBee into gridAphid
    var gridAphid = [
      [ 'a', 'b', 'c' ],
      [ 'd', 'e', 'f' ],
      [ 'g', 'h', 'i' ],
      [ 'j', 'k', 'l' ]
    ];

    var gridBee = [
      ['bee1'],
      ['bee2'],
      ['bee3'],
      ['bee3'],
      ['bee3']
    ];

    var gridCicada = [
      ['cicada1', 'cicada2', 'cicada3', 'cicada3', 'cicada3', 'cicada4', 'cicada4', 'cicada4']
    ];

    // insert at 'j' a long table
    suite(
      start(3, 0), gridAphid, gridBee, generator, Fun.tripleEquals,
      {
        rowDelta: -4,
        colDelta: 2
      },
      [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
        ['j', 'k', 'l'],
        ['?_0', '?_1', '?_2'],
        ['?_3', '?_4', '?_5'],
        ['?_6', '?_7', '?_8'],
        ['?_9', '?_10', '?_11']
      ],
      [
        ['a',          'b',   'c'],
        ['d',          'e',   'f'],
        ['g',          'h',   'i'],
        ['h(bee1)_12', 'k',   'l'],
        ['h(bee2)_13', '?_1', '?_2'],
        ['h(bee3)_14', '?_4', '?_5'],
        ['h(bee3)_15', '?_7', '?_8'],
        ['h(bee3)_16', '?_10', '?_11']
      ]
    );

    // insert at 'd' a wide table
    suite(
      start(1, 0), gridAphid, gridCicada, generator, Fun.tripleEquals,
      {
        rowDelta: 2,
        colDelta: -5
      },
      [
        ['a', 'b', 'c', '?_0',  '?_1',  '?_2',  '?_3',  '?_4'],
        ['d', 'e', 'f', '?_5',  '?_6',  '?_7',  '?_8',  '?_9'],
        ['g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14'],
        ['j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19']
      ],
      [
        ['a', 'b', 'c', '?_0',  '?_1',  '?_2',  '?_3',  '?_4'],
        ['h(cicada1)_20', 'h(cicada2)_21', 'h(cicada3)_22', 'h(cicada3)_23', 'h(cicada3)_24', 'h(cicada4)_25',  'h(cicada4)_26', 'h(cicada4)_27'],
        ['g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14'],
        ['j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19']
      ]
    );

    // insert at 'd' a wide table
    suite(
      start(1, 0), gridAphid, gridCicada, generator, Fun.tripleEquals,
      {
        rowDelta: 2,
        colDelta: -5
      },
      [
        ['a', 'b', 'c', '?_0',  '?_1',  '?_2',  '?_3',  '?_4'],
        ['d', 'e', 'f', '?_5',  '?_6',  '?_7',  '?_8',  '?_9'],
        ['g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14'],
        ['j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19']
      ],
      [
        ['a', 'b', 'c', '?_0',  '?_1',  '?_2',  '?_3',  '?_4'],
        ['h(cicada1)_20', 'h(cicada2)_21', 'h(cicada3)_22', 'h(cicada3)_23', 'h(cicada3)_24', 'h(cicada4)_25',  'h(cicada4)_26', 'h(cicada4)_27'],
        ['g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14'],
        ['j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19']
      ]
    );

    // Advanced Spans
    var gridAdvancedOne = [
      [ 'A', 'B', 'B', 'C' ],
      [ 'D', 'B', 'B', 'E' ],
      [ 'F', 'F', 'F', 'E' ],
      [ 'F', 'F', 'F', 'G' ],
      [ 'F', 'F', 'F', 'H' ],
      [ 'I', 'J', 'K', 'K' ],
      [ 'I', 'L', 'L', 'M' ]
    ];

    var gridSpanB = [
      [ 'alpha', 'alpha'  ],
      [ 'beta',  'charlie']
    ];

    suite(
      // 'Merge gridSpanB, into gridAdvancedOne, at "D" on gridAdvancedOne',
      start(1, 0), gridAdvancedOne, gridSpanB, generator, Fun.tripleEquals,
      {
        rowDelta: 4,
        colDelta: 2
      },
      [
        [ 'A', 'B', 'B', 'C' ],
        [ 'D', 'B', 'B', 'E' ],
        [ 'F', 'F', 'F', 'E' ],
        [ 'F', 'F', 'F', 'G' ],
        [ 'F', 'F', 'F', 'H' ],
        [ 'I', 'J', 'K', 'K' ],
        [ 'I', 'L', 'L', 'M' ]
      ],
      [
        [ 'A', 'B', '?_0', 'C' ],
        [ 'h(alpha)_11', 'h(alpha)_12', '?_2', 'E' ],
        [ 'h(beta)_13', 'h(charlie)_14', '?_4', 'E' ],
        [ '?_5', '?_6', '?_7', 'G' ],
        [ '?_8', '?_9', '?_10', 'H' ],
        [ 'I', 'J', 'K', 'K' ],
        [ 'I', 'L', 'L', 'M' ]
      ]
    );

  }
);