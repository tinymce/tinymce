test(
  'AdjustmentsTest',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct',
    'ephox.snooker.ready.data.Structs',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.resize.Adjustments'
  ],

  function (Arr, Struct, Structs, Warehouse, Adjustments) {
    var check = function (expected, input, widths) {
      var warehouse = Warehouse.generate(input);
      var actual = Adjustments.recalculate(warehouse, widths);
      assert.eq(expected, Arr.map(actual, function (cell) {
        return {
          element: cell.element(),
          width: cell.width()
        };
      }));
    };

    var d = Structs.detail;
    var r = Struct.immutable('element', 'cells');

    check([{ element: 'a', width: 10 }], [
      r('r0', [ d('a', 1, 1) ]),
    ], [10]);

    check([
      { element: 'g', width: 10 }, { element: 'h', width: 10 }, { element: 'i', width: 10 }, { element: 'j', width: 10 }, { element: 'k', width: 30 },
      { element: 'l', width: 10 }, { element: 'm', width: 20 }, { element: 'n', width: 10 }, { element: 'o', width: 10 }, { element: 'p', width: 10 },
      { element: 'q', width: 10 }, { element: 'r', width: 10 }, { element: 's', width: 10 }, { element: 't', width: 10 }, { element: 'u', width: 10 }, { element: 'v', width: 10 }
    ], [
      r('r0', [ d('g',1,1), d('h',1,1), d('i',1,1), d('j',1,1), d('k',1,3) ]),
      r('r1', [ d('l',1,1), d('m',3,2), d('n',1,1), d('o',1,1), d('p',1,1), d('q',1,1) ]),
      r('r2', [ d('r',2,1), d('s',1,1), d('t',2,1), d('u',1,1), d('v',1,1) ])
    ], [ 10, 10, 10, 10, 10, 10, 10 ]);
  }
);
