test(
  'ArrEqualTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var check = function (expected, a1, a2) {
      var actual = Arr.equal(a1, a2);
      assert.eq(expected, actual);
    };

    check(true, [], []);
    check(false, [1], []);
    check(false, [], [1]);
    check(true, [1], [1]);
    check(false, [1], [2]);
    check(false, [2], [3]);
    check(false, [1, 2, 3], [3, 2, 1]);
    check(false, [1, 2], [1, 2, 3]);
    check(false, [1, 2, 3], [1, 2]);
    check(true, [3, 1, 2], [3, 1, 2]);
  }
);