test(
  'BlocksTest',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct',
    'ephox.snooker.data.Structs',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.Warehouse',
    'ephox.snooker.test.Stringify'
  ],

  function (Arr, Struct, Structs, Blocks, Warehouse, Stringify) {
    var s = Structs.detail;
    var f = Struct.immutable('element', 'cells');
    var warehouse = Warehouse.generate([
      f('r1', [ s('a', 1, 1), s('b', 1, 2) ]),
      f('r2', [ s('c', 2, 1), s('d', 1, 1), s('e', 1, 1) ]),
      f('r3', [ s('f', 1, 2) ])
    ]);
  
    assert.eq(['a', 'd', 'e'], Blocks.columns(warehouse));

    var checkColumn = function (expected, house, index) {
      var actual = Blocks.column(house, index);
      var munged = Arr.map(actual, function (a) {
        return [ Arr.map(a.before(), Stringify.it), Stringify.celltype(a.on()), Arr.map(a.after(), Stringify.it) ];
      });

      assert.eq(expected, munged);
    };

    checkColumn([
      [[], 'whole-a', ['b']],
      [[], 'whole-c', ['d', 'e']],
      [[], 'none', ['f']]
    ], warehouse, 0);

    checkColumn([
      [['a'], 'partial-b-0', []],
      [['c'], 'whole-d', ['e']],
      [[], 'partial-f-0', []]
    ], warehouse, 1);

    checkColumn([
      [['a'], 'partial-b-1', []],
      [['c', 'd'], 'whole-e', []],
      [[], 'partial-f-1', []]
    ], warehouse, 2);
  }
);
