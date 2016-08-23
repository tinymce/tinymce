test(
  'ContainsTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var check = function (expected, input, value) {
      assert.eq(expected, Arr.contains(input, value));
    };

    check(false, [], 1);
    check(true, [1], 1);
    check(false, [1], 2);
    check(true, [2, 4, 6], 2);
    check(true, [2, 4, 6], 4);
    check(true, [2, 4, 6], 6);
    check(false, [2, 4, 6], 3);
  }
);
