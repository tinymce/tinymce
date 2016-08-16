test(
  'ThunkTest',

  [
    'ephox.katamari.api.Thunk',
    'global!Array'
  ],

  function (Thunk, Array) {
    var args = null;
    var f = Thunk.cached(function () {
      args = Array.prototype.slice.call(arguments);
      return args;
    });
    var r1 = f('a');
    assert.eq(['a'], args);
    assert.eq(['a'], r1);
    var r2 = f('b');
    assert.eq(['a'], args);
    assert.eq(['a'], r2);
  }
);