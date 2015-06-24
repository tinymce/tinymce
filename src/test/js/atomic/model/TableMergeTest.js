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
  }
);