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
        {cells: Fun.constant([ 'A', 'B', 'B', 'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M' ]), section: Fun.constant('tbody')}
      ];
    };

    var gridSpanB = function () {
      return [
        {cells: Fun.constant([ 'alpha', 'alpha'  ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'beta',  'charlie']), section: Fun.constant('tbody')}
      ];
    };

    // These are suites which combine all 3 tests in 1 spec (measure, tailor, merge)
    // merge gridBee into gridAphid
    var gridAphid = function () {
      return [
        {cells: Fun.constant([ 'a', 'b', 'c' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'd', 'e', 'f' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'g', 'h', 'i' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'j', 'k', 'l' ]), section: Fun.constant('tbody')}
      ];
    };

    var gridBee = function () {
      return [
        {cells: Fun.constant([ 'bee1' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'bee2' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'bee3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'bee3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'bee3' ]), section: Fun.constant('tbody')}
      ];
    };

    var gridcicada = function () {
      return [
        {cells: Fun.constant([ 'cic1', 'cic2', 'cic3', 'cic3', 'cic3', 'cic4', 'cic4', 'cic4' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'a', 'b', 'c' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'd', 'e', 'f' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'g', 'h', 'i' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'j', 'k', 'l' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_0', '?_1', '?_2' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_3', '?_4', '?_5' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_6', '?_7', '?_8' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_9', '?_10', '?_11' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'a',          'b',   'c' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'd',          'e',   'f' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'g',          'h',   'i' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee1)_0', 'k',   'l' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee2)_1', '?_1', '?_2' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee3)_2', '?_4', '?_5' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee3)_3', '?_7', '?_8' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee3)_4', '?_10', '?_11' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'a', 'b', 'c', '?_0',  '?_1',  '?_2',  '?_3',  '?_4' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'd', 'e', 'f', '?_5',  '?_6',  '?_7',  '?_8',  '?_9' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'a', 'b', 'c', '?_0',  '?_1',  '?_2',  '?_3',  '?_4' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(cic1)_0', 'h(cic2)_1', 'h(cic3)_2', 'h(cic3)_3', 'h(cic3)_4', 'h(cic4)_5',  'h(cic4)_6', 'h(cic4)_7' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'g', 'h', 'i', '?_10', '?_11', '?_12', '?_13', '?_14' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'j', 'k', 'l', '?_15', '?_16', '?_17', '?_18', '?_19' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'A', 'B', 'B', 'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'A', 'B', '?_0', 'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(alpha)_0', 'h(alpha)_1', '?_2', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(beta)_2', 'h(charlie)_3', '?_4', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_5', '?_6', '?_7', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_8', '?_9', '?_10', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'A', 'B', 'B', 'C', '?_0' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E', '?_1' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E', '?_2' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G', '?_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H', '?_4' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K', '?_5' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M', '?_6' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_7', '?_8', '?_9', '?_10', '?_11' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'A', 'B', 'B', 'C', '?_0' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E', '?_1' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E', '?_2' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G', '?_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H', '?_4' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K', '?_5' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'h(alpha)_0', 'h(alpha)_1' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_7', '?_8', '?_9', 'h(beta)_2', 'h(charlie)_3' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'A', 'B', 'B', 'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'A', 'B', '?_0', 'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', '?_1', 'h(alpha)_0', 'h(alpha)_1' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', '?_4', 'h(beta)_2', 'h(charlie)_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_6', '?_7', '?_8', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_9', '?_10', '?_11', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'A', 'B', 'B', 'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_0', '?_1', '?_2', '?_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_4', '?_5', '?_6', '?_7' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'A',         'B',    'B',   'C' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D',         'B',    'B',   'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F',         '?_8',  '?_9', 'E' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ '?_10',      '?_11', '?_12', 'G' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee1)_0', '?_14', '?_15', 'H' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee2)_1', 'J',    'K',   'K' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee3)_2', 'L',    'L',   'M' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee3)_3', '?_1',  '?_2', '?_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(bee3)_4', '?_5',  '?_6', '?_7' ]), section: Fun.constant('tbody')}
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
        {cells: Fun.constant([ 'A', 'B', 'B', 'C', '?_0',  '?_1',  '?_2',  '?_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E', '?_4',  '?_5',  '?_6',  '?_7' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E', '?_8',  '?_9',  '?_10', '?_11' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G', '?_12', '?_13', '?_14', '?_15' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H', '?_16', '?_17', '?_18',  '?_19' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K', '?_20', '?_21', '?_22',  '?_23' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'L', 'L', 'M', '?_24', '?_25', '?_26',  '?_27' ]), section: Fun.constant('tbody')}
      ],
      [
        {cells: Fun.constant([ 'A', 'B', 'B', 'C', '?_0',  '?_1',  '?_2',  '?_3' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'D', 'B', 'B', 'E', '?_4',  '?_5',  '?_6',  '?_7' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'E', '?_8',  '?_9',  '?_10', '?_11' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'G', '?_12', '?_13', '?_14', '?_15' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'F', 'F', 'F', 'H', '?_16', '?_17', '?_18',  '?_19' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'I', 'J', 'K', 'K', '?_20', '?_21', '?_22',  '?_23' ]), section: Fun.constant('tbody')},
        {cells: Fun.constant([ 'h(cic1)_0','h(cic2)_1','h(cic3)_2','h(cic3)_3','h(cic3)_4','h(cic4)_5','h(cic4)_6','h(cic4)_7' ]), section: Fun.constant('tbody')}
      ]
    );

  }
);