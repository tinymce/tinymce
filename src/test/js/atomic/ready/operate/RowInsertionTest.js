test(
  'InsertionTest',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct',
    'ephox.snooker.ready.data.Structs',
    'ephox.snooker.ready.model.Warehouse',
    'ephox.snooker.ready.operate.RowInsertion'
  ],

  function (Arr, Struct, Structs, Warehouse, RowInsertion) {
    var check = function (expected, method, input, rowIndex, colIndex) {
      var warehouse = Warehouse.generate(input);
      var actual = method(warehouse, rowIndex, colIndex, function () {
        return '???';
      }, function () {
        return d('?', 1, 1);
      });

      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, i) {
        var act = actual[i];
        var raw = Arr.map(act.cells(), function (cell) {
          return {
            element: cell.element(),
            colspan: cell.colspan(),
            rowspan: cell.rowspan()
          };
        });

        assert.eq(exp, raw);
      });
    };

    var r = Struct.immutable('element', 'cells');
    var d = Structs.detail;

    var generate = function () {
      return [
        r('r0', [ d('a', 1, 1), d('c', 2, 1) ]),
        r('r1', [ d('b', 1, 1) ])
      ];
    };

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 }, { element: 'c', colspan: 1, rowspan: 3 }],
      [ { element: '?', colspan: 1, rowspan: 1 } ],
      [ { element: 'b', colspan: 1, rowspan: 1 } ]
    ], RowInsertion.insertAfter, generate(), 0, 0);

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 }, { element: 'c', colspan: 1, rowspan: 3 } ],
      [ { element: 'b', colspan: 1, rowspan: 1 } ],
      [ { element: '?', colspan: 1, rowspan: 1 } ]
    ], RowInsertion.insertAfter, generate(), 1, 0);

    // check([
    //   [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'a', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 1 } ],
    //   [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'c', colspan: 2, rowspan: 1 } ]
    // ], RowInsertion.insertBefore, generate(), 0, 0);

    // check([
    //   [ { element: 'a', colspan: 1, rowspan: 1 }, { element: '?', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 1 } ],
    //   [ { element: 'c', colspan: 3, rowspan: 1 } ]
    // ], RowInsertion.insertBefore, generate(), 0, 1);

  }
);
