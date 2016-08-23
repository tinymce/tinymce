test(
  'ForallTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var isone = function (i) {
      return i === 1;
    };

    var check = function (expected, input, f) {
      assert.eq(expected, Arr.forall(input, f));
    };

    check(true, [true, true, true]);
    check(false, [true, false, true]);
    check(true, [1, 1, 1], isone);
    check(false, [1, 2, 1], isone);

    check(false, [1, 2, 1], function (x, i) {
      return i === 0;
    });

    check(true, [1, 12, 3], function (x, i) {
      return i < 10;
    });
  }
);
