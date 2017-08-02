test(
  'BlocksTest',

  [
    'ephox.snooker.api.Structs',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.Warehouse'
  ],

  function (Structs, Blocks, Warehouse) {
    var s = Structs.detail;
    var f = Structs.rowdata;
    var warehouse = Warehouse.generate([
      f('r1', [ s('a', 1, 1), s('b', 1, 2) ], 'tbody'),
      f('r2', [ s('c', 2, 1), s('d', 1, 1), s('e', 1, 1) ], 'tbody'),
      f('r3', [ s('f', 1, 2) ], 'tbody')
    ]);
  
    assert.eq(['a', 'd', 'e'], Blocks.columns(warehouse).map(function (c) { return c.getOrDie(); }));
  }
);
