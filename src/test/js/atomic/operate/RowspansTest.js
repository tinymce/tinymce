test(
  'RowspansTest',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct',
    'ephox.snooker.data.Structs',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.operate.Rowspans'
  ],

  function (Arr, Struct, Structs, Warehouse, Rowspans) {
    var check = function (expected, warehouse, index, insertion) {
      var actual = insertion(warehouse, index);
      assert.eq(expected.spanned, Arr.map(actual.spanned(), function (s) { return s.element(); }));
      assert.eq(expected.unspanned, Arr.map(actual.unspanned(), function (s) { return s.element(); }));
    };

    var r = Struct.immutable('element', 'cells');
    var d = Structs.detail;

    var house = Warehouse.generate([
      r('r0', [ d('a', 1, 2), d('b', 1, 1), d('c', 3, 1) ]),
      r('r1', [ d('d', 2, 1), d('e', 1, 1), d('f', 1, 1) ]),
      r('r2', [ d('g', 2, 2) ]),
      r('r3', [ d('h', 1, 1), d('i', 1, 1) ])
    ]);

    check({ spanned: [], unspanned: [ 'a', 'a', 'b', 'c' ] }, house, 0, Rowspans.before);
    check({ spanned: [ 'c' ], unspanned: [ 'a', 'a', 'b' ] }, house, 0, Rowspans.after);
    check({ spanned: [ 'c' ], unspanned: [ 'd', 'e', 'f' ] }, house, 1, Rowspans.before);
    check({ spanned: [ 'd', 'c' ], unspanned: [ 'e', 'f' ] }, house, 1, Rowspans.after);
    check({ spanned: [ 'd', 'c' ], unspanned: [ 'g', 'g' ] }, house, 2, Rowspans.before);
    // the duplication of g here isn't a problem while spanned is only used on a contains basis.
    check({ spanned: [ 'g', 'g' ], unspanned: [ 'd', 'c' ] }, house, 2, Rowspans.after);
    check({ spanned: [ 'g', 'g' ], unspanned: [ 'h', 'i' ] }, house, 3, Rowspans.before);
    check({ spanned: [], unspanned: [ 'h', 'g', 'g', 'i' ] }, house, 3, Rowspans.after);

  }
);
