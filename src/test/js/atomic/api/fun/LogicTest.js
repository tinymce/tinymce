test(
  'LogicTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Logic'
  ],

  function (Fun, Logic) {

    var check = function(a, b, expected) {
      assert.eq(expected, Logic.impliesStrict(a, b));
      assert.eq(expected, Logic.implies(a, Fun.constant(b)));
    };

    check(true, true, true);
    check(true, false, false);
    check(false, true, true);
    check(false, false, true);

    var boom = function() {
      throw "This should not be called.";
    };

    assert.eq(true, Logic.implies(false, boom));
  }
);