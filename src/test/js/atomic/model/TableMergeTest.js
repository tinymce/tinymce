test(
  'TableMergeTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.test.TableMerge',
    'ephox.snooker.test.TestGenerator'
  ],

  function (Fun, Structs, TableMerge, TestGenerator) {
    var generator = TestGenerator;
    var start = Structs.address;
    var detectSpanTest = TableMerge.detectSpanTest;
    var suite = TableMerge.suite;

    var check = function (test, expected, startAddress, gridA, gridB, generator, comparator) {
      test(expected, startAddress, gridA, gridB, generator, comparator);
    };

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


    // detectSpan is none recursive, finds the first span intersection and returns it
    check(detectSpanTest, 'B', /*start A*/ start(0, 0), gridAdvancedOne, gridSpanB, Fun.noop, Fun.tripleEquals);
    check(detectSpanTest, 'F', /*start F*/ start(2, 0), gridAdvancedOne, gridSpanB, Fun.noop, Fun.tripleEquals);
    check(detectSpanTest, 'K', /*start J*/ start(5, 1), gridAdvancedOne, gridSpanB, Fun.noop, Fun.tripleEquals);
    check(detectSpanTest, 'K', /*start K*/ start(5, 2), gridAdvancedOne, gridSpanB, Fun.noop, Fun.tripleEquals);

    // These are suites which combine all 3 tests in 1 spec (measure, tailor, merge)
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

    suite(
      'insert at "j" a long table',
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

    suite(
      'insert at "d" a wide table',
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

    suite(
      'Merge gridSpanB, into gridAdvancedOne, at "D" on gridAdvancedOne',
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