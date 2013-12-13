test(
  'BlocksTest',

  [
    'ephox.compass.Obj',
    'ephox.snooker.ready.data.Structs',
    'ephox.snooker.ready.lookup.Blocks',
    'ephox.snooker.ready.model.Warehouse'
  ],

  function (Obj, Structs, Blocks, Warehouse) {
    var s = Structs.detail;
    var warehouse = Warehouse.generate([
      [ s('a', 1, 1), s('b', 1, 2) ],
      [ s('c', 2, 1), s('d', 1, 1), s('e', 1, 1) ],
      [ s('f', 1, 2) ]
    ]);

    assert.eq(['a', 'd', 'e'], Blocks.columns(warehouse));

  }
);
