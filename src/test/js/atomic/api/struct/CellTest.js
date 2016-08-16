test(
  'Cell',

  [
    'ephox.katamari.api.Cell'
  ],

  function (Cell) {
    var single = Cell('hello world');
    assert.eq('hello world', single.get());
    single.set('again');
    assert.eq('again', single.get());
  }
);