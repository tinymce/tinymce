test(
  'SizeTest',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
    var check = function (expected, input) {
      assert.eq(expected, Obj.size(input));
    };

    check(0, {});
    check(1, { a:'a' });
    check(3, { a:'a', b:'b', c:'c' });
  }
);
