test(
  'SpanningCellsTest',

  [
    'ephox.scullion.Struct',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.SpanningCells'
  ],

  function (Struct, Structs, Warehouse, SpanningCells) {


    var s = Structs.detail;  // 'element', 'rowspan', 'colspan'
    var f = Struct.immutable('element', 'cells');

    var testTableA = [
      f('r1', [ s('a',1,1), s('b',1,1), s('c',1,1), s('d',1,1), s('e',1,1) ]),
      f('r2', [ s('f',1,1), s('g',1,1), s('h',1,2), s('i',1,1) ]),
      f('r3', [ s('l',1,1), s('m',1,1), s('n',1,3)]),
      f('r4', [ s('o',1,1), s('p',1,1), s('q',1,2), s('r',1,1) ]),
      f('r5', [ s('s',1,1), s('t',1,1), s('u',1,1), s('v',1,1), s('z',1,1)])
    ];
    var inputA = Warehouse.generate(testTableA);

    // var bounds = Struct.immutableBag([ 'startRow', 'startCol', 'finishRow', 'finishCol'], []);
    // var cell = Struct.immutableBag([ 'row', 'col'], [] );

    var baseBound = Structs.bounds({
      startRow: 1,
      startCol: 1,
      finishRow: 3,
      finishCol: 3
    });
    var cellA = Structs.cell({
      row: 2,
      col: 2
    });

    var resultA = SpanningCells.isSpanning(inputA.access(), cellA, baseBound);
    assert.eq(false, resultA);

    var cellB = Structs.cell({
      row: 3,
      col: 3
    });
    var resultB = SpanningCells.isSpanning(inputA.access(), cellB, baseBound);
    assert.eq(true, resultB);

    var cellC = Structs.cell({
      row: 0,
      col: 0
    });
    var resultC = SpanningCells.isSpanning(inputA.access(), cellC, baseBound);
    assert.eq(false, resultC);


    var cellD = Structs.cell({
      row: 3,
      col: 1
    });
    var resultD = SpanningCells.isSpanning(inputA.access(), cellD, baseBound);
    assert.eq(true, resultD);



    // 'element', 'rowspan', 'colspan'
    var testTableB = [
      f('r1', [ s('a',3,1), s('b',1,1), s('c',1,1), s('d',2,1) ]),
      f('r2', [ s('e',2,2) ]),
      f('r3', [ s('f',2,1) ]),
      f('r4', [ s('g',1,3) ])
    ];
    var inputB = Warehouse.generate(testTableB);

    var baseBoundB = Structs.bounds({
      startRow: 0,
      startCol: 0,
      finishRow: 2,
      finishCol: 2
    });
    var cellE = Structs.cell({
      row: 3,
      col: 0
    });
    var resultE = SpanningCells.isSpanning(inputB.access(), cellE, baseBoundB);
    assert.eq(false, resultE);

    var cellF = Structs.cell({
      row: 0,
      col: 1
    });
    var resultF = SpanningCells.isSpanning(inputB.access(), cellF, baseBoundB);
    assert.eq(true, resultF);

    var cellG = Structs.cell({
      row: 1,
      col: 1
    });
    var resultG = SpanningCells.isSpanning(inputB.access(), cellG, baseBoundB);
    assert.eq(true, resultG);

    var cellH = Structs.cell({
      row: 2,
      col: 2
    });
    var resultH = SpanningCells.isSpanning(inputB.access(), cellH, baseBoundB);
    assert.eq(true, resultH);

    var cellI = Structs.cell({
      row: 1,
      col: 3
    });
    var resultI = SpanningCells.isSpanning(inputB.access(), cellI, baseBoundB);
    assert.eq(false, resultI);
  }
);