test(
  'SpanningCellsTest',

  [
    'ephox.scullion.Struct',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells'
  ],

  function (Struct, Structs, Warehouse, SpanningCells) {


    var s = Structs.detail; // 'element', 'rowspan', 'colspan'
    var f = Struct.immutable('element', 'cells');

    var testTable = [
      f('r1', [ s('a',1,1), s('b',1,1), s('c',1,1), s('d',1,1), s('e',1,1) ]),
      f('r2', [ s('f',1,1), s('g',1,1), s('h',1,2), s('i',1,1) ]),
      f('r3', [ s('l',1,1), s('m',1,1), s('n',1,3)]),
      f('r4', [ s('o',1,1), s('p',1,1), s('q',1,2), s('r',1,1) ]),
      f('r5', [ s('s',1,1), s('t',1,1), s('u',1,1), s('v',1,1), s('z',1,1)])
    ];
    var inputA = Warehouse.generate(testTable);

    // We are checking if the cell in position 2,2 is within the rectangle
    var feedA = Structs.spanningCell({
      structure : inputA.all(),
      startRow: 1,
      startCol : 1,
      finishRow : 3,
      finishCol : 3,
      cellRow : 2,
      cellCol : 2
    });

    var resultA = SpanningCells.isSpanning(feedA);
    assert.eq(false, resultA);

    var feedC = Structs.spanningCell({
      structure : inputA.all(),
      startRow: 1,
      startCol : 1,
      finishRow : 3,
      finishCol : 3,
      cellRow : 0,
      cellCol : 0
    });
    var resultC = SpanningCells.isSpanning(feedC);
    assert.eq(false, resultC);

    var feedB = Structs.spanningCell({
      structure : inputA.all(),
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