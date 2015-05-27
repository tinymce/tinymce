test(
  'SpanningCellsTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.api.Structs',
    'ephox.snooker.selection.SpanningCells'
  ],

  function (Fun, Structs, SpanningCells) {

    var cell = function (element, colspan, rowspan) {
      return {
        element: Fun.constant(element),
        colspan: Fun.constant(colspan),
        rowspan: Fun.constant(rowspan),

      };
    };



    var inputA = [
      [ cell('a',1,1), cell('b',1,1), cell('c',1,1), cell('d',1,1), cell('e',1,1) ],
      [ cell('f',1,1), cell('g',1,1), cell('h',2,1), cell('h',2,1), cell('i',1,1) ],
      [ cell('l',1,1), cell('m',1,1), cell('n',3,1), cell('n',3,1), cell('n',3,1) ],
      [ cell('o',1,1), cell('p',1,1), cell('q',2,1), cell('q',2,1), cell('r',1,1) ],
      [ cell('s',1,1), cell('t',1,1), cell('u',1,1), cell('v',1,1), cell('z',1,1) ]
    ];

    var feedA = Structs.spanningCell({
      structure : inputA,
      startRow: 1,
      startCol : 1,
      finishRow : 3,
      finishCol : 3,
      cellRow : 2,
      cellCol : 2
    });

    var resultA = SpanningCells.isSpanning(feedA);
    assert.eq(true, resultA);

    var feedB = Structs.spanningCell({
      structure : inputA,
      startRow: 1,
      startCol : 1,
      finishRow : 3,
      finishCol : 3,
      cellRow : 3,
      cellCol : 3
    });

    var resultB = SpanningCells.isSpanning(feedB);
    assert.eq(false, resultB);

  }
);