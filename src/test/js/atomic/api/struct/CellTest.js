test(
  'Cell',

  [
    'ephox.katamari.api.Cell',
    'ephox.wrap.Jsc'
  ],

  function (Cell, Jsc) {
    var single = Cell('hello world');
    assert.eq('hello world', single.get());
    single.set('again');
    assert.eq('again', single.get());

    Jsc.property('cell(x).get() === x', Jsc.json, function (json) {
      var cell = Cell(json);
      return Jsc.eq(json, cell.get());
    });

    Jsc.property('cell.get() === last set call', Jsc.json, Jsc.json, Jsc.json, function (a, b, c) {
      var cell = Cell(a);
      var first = cell.get();
      cell.set(b);
      var second = cell.get();
      cell.set(c);
      var third = cell.get();
      return Jsc.eq(a, first) && Jsc.eq(b, second) && Jsc.eq(c, third);
    });
  }
);