test(
  'InsertionTest',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct',
    'ephox.snooker.api.Structs',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.ColumnModification'
  ],

  function (Arr, Struct, Structs, Warehouse, ColumnModification) {
    var check = function (expected, method, input, rowIndex, colIndex) {
      var warehouse = Warehouse.generate(input);
      var actual = method(warehouse, rowIndex, colIndex, {
        cell: function () {
          return d('?', 1, 1);
        }
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
        r('r0', [ d('a', 1, 1), d('b', 1, 1) ]),
        r('r1', [ d('c', 1, 2) ])
      ];
    };

    check([
      [ { element: 'b', colspan: 1, rowspan: 1 } ],
      [ { element: 'c', colspan: 1, rowspan: 1 } ]
    ], ColumnModification.erase, generate(), 0, 0);

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 } ],
      [ { element: 'c', colspan: 1, rowspan: 1 } ]
    ], ColumnModification.erase, generate(), 0, 1);

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 }, { element: '?', colspan: 1, rowspan: 1 } ]
    ], ColumnModification.insertAfter, [ r('r0', [ d('a', 1, 1) ]) ], 0, 0);

    check([
      [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'a', colspan: 1, rowspan: 1 } ]
    ], ColumnModification.insertBefore, [ r('r0', [ d('a', 1, 1) ]) ], 0, 0);

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 }, { element: '?', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 1 } ],
      [ { element: 'c', colspan: 3, rowspan: 1 } ]
    ], ColumnModification.insertAfter, generate(), 0, 0);

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 1 }, { element: '?', colspan: 1, rowspan: 1 } ],
      [ { element: 'c', colspan: 2, rowspan: 1 }, { element: '?', colspan: 1, rowspan: 1 } ]
    ], ColumnModification.insertAfter, generate(), 0, 1);

    check([
      [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'a', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 1 } ],
      [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'c', colspan: 2, rowspan: 1 } ]
    ], ColumnModification.insertBefore, generate(), 0, 0);

    check([
      [ { element: 'a', colspan: 1, rowspan: 1 }, { element: '?', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 1 } ],
      [ { element: 'c', colspan: 3, rowspan: 1 } ]
    ], ColumnModification.insertBefore, generate(), 0, 1);

    check([
      [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'a1', colspan: 1, rowspan: 1 }, { element: 'a2', colspan: 1, rowspan: 1 } ],
      [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'b', colspan: 1, rowspan: 2 }, { element: 'c', colspan: 1, rowspan: 1 } ],
      [ { element: '?', colspan: 1, rowspan: 1 }, { element: 'd', colspan: 1, rowspan: 1 } ]
    ], ColumnModification.insertBefore, [
      r('r0', [ d('a1', 1, 1), d('a2', 1, 1) ]),
      r('r1', [ d('b', 2, 1), d('c', 1, 1) ]),
      r('r2', [ d('d', 1, 1) ])
    ], 0, 0);

  }
);
