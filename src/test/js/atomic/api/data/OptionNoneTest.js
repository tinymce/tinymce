test(
  'OptionNoneTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'global!Array'
  ],

  function (Fun, Option, Array) {
    var testSanity = function () {
      var s = Option.none();
      assert.eq(false, s.isSome());
      assert.eq(true, s.isNone());
      assert.eq(6, s.getOr(6));
      assert.eq(6, s.getOrThunk(function () { return 6; }));
      assert.throws(function () { s.getOrDie('Died!'); });
      assert.eq(6, s.or(Option.some(6)).getOrDie());
      assert.eq(6, s.orThunk(function () {
        return Option.some(6);
      }).getOrDie());


      assert.eq(true, s.map(function (v) {
        return v * 2;
      }).isNone());

      assert.eq(true, s.bind(function (v) {
        return Option.some('test' + v);
      }).isNone());

      assert.eq(true, s.flatten().isNone());
      assert.eq(true, s.filter(Fun.constant(true)).flatten().isNone());
      assert.eq(true, s.filter(Fun.constant(false)).flatten().isNone());

      assert.eq(false, Option.from(null).isSome());
      assert.eq(false, Option.from(undefined).isSome());

      assert.eq(true, Option.none().equals(Option.none()));
      assert.eq(false, Option.none().equals(Option.some(3)));

      assert.eq([], Option.none().toArray());

      assert.eq(true, Option.none().ap(Option.some(Fun.die('boom'))).equals(Option.none()));

      assert.eq(true, Option.none().or(Option.some(7)).equals(Option.some(7)));
      assert.eq(true, Option.none().or(Option.none()).equals(Option.none()));

      var assertOptionEq = function(expected, actual) {
        var same = expected.isNone() ? actual.isNone() : (actual.isSome() && expected.getOrDie() === actual.getOrDie());
        if (!same) {
          // assumes toString() works
          assert.fail('Expected: ' + expected.toString() + ' Actual: ' + actual.toString());
        }
      };

      assertOptionEq(Option.none(), Option.some(5).filter(function(x) { return x === 8; }));
      assertOptionEq(Option.none(), Option.some(5).filter(Fun.constant(false)));
      assertOptionEq(Option.none(), Option.none().filter(Fun.die('boom')));

      assert.eq('zz', Option.none().fold(function() { return 'zz'; }, Fun.die('boom')));
      assert.eq([], Option.none().fold(function () { return Array.prototype.slice.call(arguments); }, Fun.die('boom')));
      assert.eq('b', Option.none().fold(Fun.constant('b'), Fun.die('boom')));
    };

    testSanity();
  }
);