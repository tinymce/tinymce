test(
  'OptionNoneTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc',
    'global!Array'
  ],

  function (Fun, Option, ArbDataTypes, Jsc, Array) {
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

    var testSpecs = function () {
      var arbOptionNone = ArbDataTypes.optionNone;

      Jsc.property('Checking none.is === false', arbOptionNone, function (opt) {
        var v = opt.fold(Fun.identity, Fun.die('should be option.none'));
        return Jsc.eq(false, opt.is(v));
      });

      Jsc.property('Checking none.isSome === false', arbOptionNone, function (opt) {
        return Jsc.eq(false, opt.isSome());
      });
      

      Jsc.property('Checking none.isNone === true', arbOptionNone, function (opt) {
        return Jsc.eq(true, opt.isNone());
      });

  
      Jsc.property('Checking none.getOr(v) === v', arbOptionNone, 'json', function (opt, json) {
        return Jsc.eq(json, opt.getOr(json));
      });


      // Require non empty string of msg falsiness gets in the way.
      Jsc.property('Checking none.getOrDie() always throws', arbOptionNone, Jsc.nestring, function (opt, s) {
        try {
          opt.getOrDie(s);
          return false;
        } catch (err) {
          return Jsc.eq(s, err.message);
        }
      });


      return;

      Jsc.property('Checking error.or(oValue) === oValue', arbResultError, 'json', function (opt, json) {
        var output = opt.or(Result.value(json));
        return Jsc.eq(true, output.is(json));
      });

      Jsc.property('Checking error.orThunk(_ -> v) === v', arbResultError, 'json', function (opt, json) {
        var output = opt.orThunk(function () {
          return Result.value(json);
        });
        return Jsc.eq(true, output.is(json));
      });

      Jsc.property('Checking error.fold(_ -> x, die) === x', arbResultError, 'json', function (opt, json) {
        var actual = opt.fold(Fun.constant(json), Fun.die('Should not die'));
        return Jsc.eq(json, actual);
      });

      Jsc.property('Checking error.map(f) === error', arbResultError, 'string -> json', function (opt, f) {
        var actual = opt.map(f);
        return Jsc.eq(true, actual.fold(function (e) {
          return e == opt.fold(Fun.identity, Fun.die('should not get here!'));
        }), Fun.constant(false));
      });

      Jsc.property('Checking error.map(f) === error', arbResultError, 'string -> json', function (opt, f) {
        var actual = opt.map(f);
        return Jsc.eq(true, getErrorOrDie(opt) === getErrorOrDie(actual));
      });

      Jsc.property('Checking error.each(f) === undefined', arbResultError, 'string -> json', function (opt, f) {
        var actual = opt.each(f);
        return Jsc.eq(undefined, actual);
      });

      Jsc.property('Given f :: s -> RV, checking error.bind(f) === error', arbResultError, Jsc.fn(arbResultValue), function (opt, f) {
        var actual = opt.bind(f);
        return Jsc.eq(true, getErrorOrDie(opt) === getErrorOrDie(actual));
      });

      Jsc.property('Given f :: s -> RE, checking error.bind(f) === error', arbResultError, Jsc.fn(arbResultError), function (opt, f) {
        var actual = opt.bind(f);
        return Jsc.eq(true, getErrorOrDie(opt) === getErrorOrDie(actual));
      });

      Jsc.property('Checking error.forall === true', arbResultError, 'string -> bool', function (opt, f) {
        return Jsc.eq(true, opt.forall(f));
      });

      Jsc.property('Checking error.exists === false', arbResultError, 'string -> bool', function (opt, f) {
        return Jsc.eq(false, opt.exists(f));
      });

      Jsc.property('Checking error.toOption is always none', arbResultError, function (opt) {
        return Jsc.eq(true, opt.toOption().isNone());
      });
    };

    testSanity();
    testSpecs();
  }
);