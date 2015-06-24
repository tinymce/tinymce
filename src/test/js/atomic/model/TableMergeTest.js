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
    var suite = TableMerge.suite;

    // Advanced Spans
    var gridAdvancedOne = function () {
      return [
        [ 'A', 'B', 'B', 'C' ],
        [ 'D', 'B', 'B', 'E' ],
        [ 'F', 'F', 'F', 'E' ],
        [ 'F', 'F', 'F', 'G' ],
        [ 'F', 'F', 'F', 'H' ],
        [ 'I', 'J', 'K', 'K' ],
        [ 'I', 'L', 'L', 'M' ]
      ];
    };

    var gridSpanB = function () {
      return [
        [ 'alpha', 'alpha'  ],
        [ 'beta',  'charlie']
      ];
    };

    // These are suites which combine all 3 tests in 1 spec (measure, tailor, merge)
    // merge gridBee into gridAphid
    var gridAphid = function () {
      return [
        [ 'a', 'b', 'c' ],
        [ 'd', 'e', 'f' ],
        [ 'g', 'h', 'i' ],
        [ 'j', 'k', 'l' ]
      ];
    };

    var gridBee = function () {
      return [
        ['bee1'],
        ['bee2'],
        ['bee3'],
        ['bee3'],
        ['bee3']
      ];
    };

    var gridcicada = function () {
      return [
        ['cic1', 'cic2', 'cic3', 'cic3', 'cic3', 'cic4', 'cic4', 'cic4']
      ];
    };

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
        ['h(bee1)_0', 'k',   'l'],
        ['h(bee2)_1', '?_1', '?_2'],
        ['h(bee3)_2', '?_4', '?_5'],
        ['h(bee3)_3', '?_7', '?_8'],
        ['h(bee3)_4', '?_10', '?_11']
      ]
    );

    suite(
      'insert at "d" a wide table',
      start(1, 0), gridAphid, gridcicada, generator, Fun.tripleEquals,
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
        ['h(cic1)_0', 'h(cic2)_1', 'h(cic3)_2', 'h(cic3)_3', 'h(cic3)_4', 'h(cic4)_5',  'h(cic4)_6', 'h(cic4)_7'],
        ['g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14'],
        ['j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19']
      ]
    );

    suite(
      'Unmerging spans - Merge gridSpanB, into gridAdvancedOne, at "D" on gridAdvancedOne',
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
        [ 'h(alpha)_0', 'h(alpha)_1', '?_2', 'E' ],
        [ 'h(beta)_2', 'h(charlie)_3', '?_4', 'E' ],
        [ '?_5', '?_6', '?_7', 'G' ],
        [ '?_8', '?_9', '?_10', 'H' ],
        [ 'I', 'J', 'K', 'K' ],
        [ 'I', 'L', 'L', 'M' ]
      ]
    );

    suite(
      'Unmerging spans - Merge gridSpanB, into gridAdvancedOne, at "M" on gridAdvancedOne',
      start(6, 3), gridAdvancedOne, gridSpanB, generator, Fun.tripleEquals,
      {
        rowDelta: -1,
        colDelta: -1
      },
      [
        [ 'A', 'B', 'B', 'C', '?_0' ],
        [ 'D', 'B', 'B', 'E', '?_1' ],
        [ 'F', 'F', 'F', 'E', '?_2' ],
        [ 'F', 'F', 'F', 'G', '?_3' ],
        [ 'F', 'F', 'F', 'H', '?_4' ],
        [ 'I', 'J', 'K', 'K', '?_5' ],
        [ 'I', 'L', 'L', 'M', '?_6' ],
        [ '?_7', '?_8', '?_9', '?_10', '?_11' ]
      ],
      [
        [ 'A', 'B', 'B', 'C', '?_0' ],
        [ 'D', 'B', 'B', 'E', '?_1' ],
        [ 'F', 'F', 'F', 'E', '?_2' ],
        [ 'F', 'F', 'F', 'G', '?_3' ],
        [ 'F', 'F', 'F', 'H', '?_4' ],
        [ 'I', 'J', 'K', 'K', '?_5' ],
        [ 'I', 'L', 'L', 'h(alpha)_0', 'h(alpha)_1' ],
        [ '?_7', '?_8', '?_9', 'h(beta)_2', 'h(charlie)_3' ]
      ]
    );

    suite(
      'Unmerging spans - Merge gridSpanB, into gridAdvancedOne, at bottom right "B" on gridAdvancedOne',
      start(1, 2), gridAdvancedOne, gridSpanB, generator, Fun.tripleEquals,
      {
        rowDelta: 4,
        colDelta: 0
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
        [ 'D', '?_1', 'h(alpha)_0', 'h(alpha)_1' ],
        [ 'F', '?_4', 'h(beta)_2', 'h(charlie)_3' ],
        [ '?_6', '?_7', '?_8', 'G' ],
        [ '?_9', '?_10', '?_11', 'H' ],
        [ 'I', 'J', 'K', 'K' ],
        [ 'I', 'L', 'L', 'M' ]
      ]
    );

    suite(
      'Unmerging spans - Merge gridBee, into gridAdvancedOne, at bottom left "F" on gridAdvancedOne',
      start(4, 0), gridAdvancedOne, gridBee, generator, Fun.tripleEquals,
      {
        rowDelta: -2,
        colDelta: 3
      },
      [
        [ 'A', 'B', 'B', 'C' ],
        [ 'D', 'B', 'B', 'E' ],
        [ 'F', 'F', 'F', 'E' ],
        [ 'F', 'F', 'F', 'G' ],
        [ 'F', 'F', 'F', 'H' ],
        [ 'I', 'J', 'K', 'K' ],
        [ 'I', 'L', 'L', 'M' ],
        [ '?_0', '?_1', '?_2', '?_3' ],
        [ '?_4', '?_5', '?_6', '?_7' ]
      ],
      [
        [ 'A',         'B',    'B',   'C' ],
        [ 'D',         'B',    'B',   'E' ],
        [ 'F',         '?_8',  '?_9', 'E' ],
        [ '?_10',      '?_11', '?_12', 'G' ],
        [ 'h(bee1)_0', '?_14', '?_15', 'H' ],
        [ 'h(bee2)_1', 'J',    'K',   'K' ],
        [ 'h(bee3)_2', 'L',    'L',   'M' ],
        [ 'h(bee3)_3', '?_1',  '?_2', '?_3' ],
        [ 'h(bee3)_4', '?_5',  '?_6', '?_7' ]
      ]
    );

    suite(
      'Unmerging spans - Merge gridcicada, into gridAdvancedOne, at bottom left "I" on gridAdvancedOne',
      start(6, 0), gridAdvancedOne, gridcicada, generator, Fun.tripleEquals,
      {
        rowDelta: 0,
        colDelta: -4
      },
      [
        [ 'A', 'B', 'B', 'C', '?_0',  '?_1',  '?_2',  '?_3' ],
        [ 'D', 'B', 'B', 'E', '?_4',  '?_5',  '?_6',  '?_7' ],
        [ 'F', 'F', 'F', 'E', '?_8',  '?_9',  '?_10', '?_11' ],
        [ 'F', 'F', 'F', 'G', '?_12', '?_13', '?_14', '?_15' ],
        [ 'F', 'F', 'F', 'H', '?_16', '?_17', '?_18',  '?_19' ],
        [ 'I', 'J', 'K', 'K', '?_20', '?_21', '?_22',  '?_23' ],
        [ 'I', 'L', 'L', 'M', '?_24', '?_25', '?_26',  '?_27' ]
      ],
      [
        [ 'A', 'B', 'B', 'C', '?_0',  '?_1',  '?_2',  '?_3' ],
        [ 'D', 'B', 'B', 'E', '?_4',  '?_5',  '?_6',  '?_7' ],
        [ 'F', 'F', 'F', 'E', '?_8',  '?_9',  '?_10', '?_11' ],
        [ 'F', 'F', 'F', 'G', '?_12', '?_13', '?_14', '?_15' ],
        [ 'F', 'F', 'F', 'H', '?_16', '?_17', '?_18',  '?_19' ],
        [ 'I', 'J', 'K', 'K', '?_20', '?_21', '?_22',  '?_23' ],
        [ 'h(cic1)_0','h(cic2)_1','h(cic3)_2','h(cic3)_3','h(cic3)_4','h(cic4)_5','h(cic4)_6','h(cic4)_7' ]
      ]
    );

  }
);