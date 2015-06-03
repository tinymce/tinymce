test(
  'BlocksTest',

  [
    'ephox.scullion.Struct',
    'ephox.snooker.api.Structs',
    'ephox.snooker.lookup.Blocks',
    'ephox.snooker.model.Warehouse'
  ],

  function (Struct, Structs, Blocks, Warehouse) {
    var s = Structs.detail;
    var f = Struct.immutable('element', 'cells');
    var warehouse = Warehouse.generate([
      f('r1', [ s('a', 1, 1), s('b', 1, 2) ]),
      f('r2', [ s('c', 2, 1), s('d', 1, 1), s('e', 1, 1) ]),
      f('r3', [ s('f', 1, 2) ])
    ]);
  
    assert.eq(['a', 'd', 'e'], Blocks.columns(warehouse));
  }
);
