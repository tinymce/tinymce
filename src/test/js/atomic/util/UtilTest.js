test(
  'UtilTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.util.Util'
  ],

  function (Fun, Util) {
    var eq = function (a, b) {
      return a === b;
    };

    assert.eq([], Util.repeat(0, Fun.constant('a')));
    assert.eq([0] ,Util.repeat(1, Fun.identity));
    assert.eq([0, 1, 2, 3] ,Util.repeat(4, Fun.identity));

    assert.eq([4, 5, 6, 7, 8], Util.range(4, 9));

    assert.eq([], Util.unique([], eq));
    assert.eq([1], Util.unique([1], eq));
    assert.eq([1, 2, 3, 4], Util.unique([1, 1, 2, 2, 2, 3, 4, 4], eq));

  }
);
