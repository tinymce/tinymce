test(
  'CellBounds.isWithin Test',

  [
    'ephox.scullion.Struct',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.selection.CellBounds'
  ],

  function (Struct, Structs, Warehouse, CellBounds) {
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

    var bounds1To3 = Structs.bounds({ startRow: 1, startCol: 1, finishRow: 3, finishCol: 3 });
    
    var check = function (expected, warehouse, bounds, row, column) {
      var cell = Warehouse.getAt(warehouse, row, column).getOrDie();
      var actual = CellBounds.isWithin(bounds, cell);
      assert.eq(expected, actual);
    };

    check(false, inputA, bounds1To3, 2, 2);
    check(true, inputA, bounds1To3, 3, 3);
    check(false, inputA, bounds1To3, 0, 0);
    check(true, inputA, bounds1To3, 3, 1);

    // 'element', 'rowspan', 'colspan'
    var testTableB = [
      f('r1', [ s('a',3,1), s('b',1,1), s('c',1,1), s('d',2,1) ]),
      f('r2', [ s('e',2,2) ]),
      f('r3', [ s('f',2,1) ]),
      f('r4', [ s('g',1,3) ])
    ];
    var inputB = Warehouse.generate(testTableB);

    var bounds0To2 = Structs.bounds({ startRow: 0, startCol: 0, finishRow: 2, finishCol: 2 });

    check(false, inputB, bounds0To2, 3, 0);
    check(true, inputB, bounds0To2, 0, 1);
    check(true, inputB, bounds0To2, 1, 1);
    check(true, inputB, bounds0To2, 2, 2);
    check(false, inputB, bounds0To2, 1, 3);
  }
);