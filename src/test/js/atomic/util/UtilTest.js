test(
  'UtilTest',

  [
    'ephox.peanut.Fun',
    'ephox.snooker.util.Util'
  ],

  function (Fun, Util) {
    assert.eq([], Util.repeat(0, Fun.constant('a')));
    assert.eq([0] ,Util.repeat(1, Fun.identity));
    assert.eq([0, 1, 2, 3] ,Util.repeat(4, Fun.identity));

    assert.eq([4, 5, 6, 7, 8], Util.range(4, 9));

  }
);
