test(
  'OptionSomeTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
    var testSanity = function () {
      var boom = function(f) { throw 'Should not be called'; };

      var s = Option.some(5);   
      assert.eq(true, s.isSome());
      assert.eq(false, s.isNone());
      assert.eq(5, s.getOr(6));
      assert.eq(5, s.getOrThunk(function () { return 6; }));
      assert.eq(5, s.getOrDie('Died!'));
      assert.eq(5, s.or(Option.some(6)).getOrDie());
      assert.eq(5, s.orThunk(boom).getOrDie());

      assert.eq(11, s.fold(boom, function (v) {
        return v + 6;
      }));

      assert.eq(10, s.map(function (v) {
        return v * 2;
      }).getOrDie());

      assert.eq('test5', s.bind(function (v) {
        return Option.some('test' + v);
      }).getOrDie());

      assert.eq(5, Option.some(s).flatten().getOrDie());
      assert.eq(true, Option.some(Option.none()).flatten().isNone());
      assert.eq(5, s.filter(Fun.constant(true)).getOrDie());
      assert.eq(true, s.filter(Fun.constant(false)).flatten().isNone());

    };

    testSanity();
  }
);