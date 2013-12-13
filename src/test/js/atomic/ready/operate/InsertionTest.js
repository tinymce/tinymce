test(
  'InsertionTest',

  [
    'ephox.scullion.Struct',
    'ephox.snooker.ready.data.Structs',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.operate.Insertion',
    'ephox.snooker.test.Assertions'
  ],

  function (Struct, Structs, Warehouse, Insertion, Assertions) {
    var check = function (expected, method, input, cx, cy) {
      var warehouse = Warehouse.generate(input);
      var actual = method(warehouse, cx, cy, function () {
        return d('?', 1, 1);
      });
      Assertions.assertInfo(expected, actual);
    };

    var r = Struct.immutable('element', 'cells');
    var d = Structs.detail;

    var generate = function () {
      return [
        r('r0', [ d('a', 1, 1), d('b', 1, 1) ]),
        r('r1', [ d('c', 1, 2) ])
      ];
    };

    check([
      r('r0', [ { id: 'b', colspan: 1, rowspan: 1 } ]),
      r('r1', [ { id: 'c', colspan: 1, rowspan: 1 } ])
    ], Insertion.erase, generate(), 0, 0);

    // check([
    //   [ { id: 'a', colspan: 1, rowspan: 1 } ],
    //   [ { id: 'c', colspan: 1, rowspan: 1 } ]
    // ], Insertion.erase, generate(), 1, 0);


    // check([
    //   [ { id: 'a', colspan: 1, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 } ],
    //   [ { id: 'c', colspan: 3, rowspan: 1 } ]
    // ], Insertion.insertAfter, generate(), 0, 0);

    // check([
    //   [ { id: 'a', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 } ],
    //   [ { id: 'c', colspan: 2, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 } ]
    // ], Insertion.insertAfter, generate(), 1, 0);

    // check([
    //   [ { id: '?', colspan: 1, rowspan: 1 }, { id: 'a', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 } ],
    //   [ { id: '?', colspan: 1, rowspan: 1 }, { id: 'c', colspan: 2, rowspan: 1 } ]
    // ], Insertion.insertBefore, generate(), 0, 0);

    // check([
    //   [ { id: 'a', colspan: 1, rowspan: 1 }, { id: '?', colspan: 1, rowspan: 1 }, { id: 'b', colspan: 1, rowspan: 1 } ],
    //   [ { id: 'c', colspan: 3, rowspan: 1 } ]
    // ], Insertion.insertBefore, generate(), 1, 0);

  }
);
