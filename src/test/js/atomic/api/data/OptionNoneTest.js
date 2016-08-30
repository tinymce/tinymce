test(
  'OptionNoneTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
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
    };

    testSanity();
  }
);