test(
  'MapToArrayTest',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
    var stringify = function (x, i) {
      return i + " :: " + x;
    };

    var check = function (expected, input, f) {
      assert.eq(expected, Obj.mapToArray(input, f));
    };

    check([], {}, stringify);
    check(['a :: a'], {a:'a'}, stringify);
    check(['a :: a','b :: b','c :: c'], {a:'a', b:'b', c:'c'}, stringify);
  }
);
