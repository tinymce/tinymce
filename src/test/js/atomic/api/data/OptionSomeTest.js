test(
  'OptionSomeTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc',
    'global!Array',
    'global!Math'
  ],

  function (Fun, Option, ArbDataTypes, Jsc, Array, Math) {
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

      assert.eq(true, Option.from(5).isSome());
      assert.eq(5, Option.from(5).getOrDie('Died!'));


      assert.eq(false, Option.some(4).equals(Option.none()));
      assert.eq(false, Option.some(2).equals(Option.some(4)));
      assert.eq(true, Option.some(5).equals(Option.some(5)));
      assert.eq(false, Option.some(5.1).equals(Option.some(5.3)));

      var comparator = function(a, b) { return Math.round(a) === Math.round(b); };

      assert.eq(true, Option.some(5.1).equals_(Option.some(5.3), comparator));
      assert.eq(false, Option.some(5.1).equals_(Option.some(5.9), comparator));
      assert.eq(true, Option.equals_(Option.some(5.1), Option.some(5.3), comparator));

      assert.eq([1], Option.some(1).toArray());
      assert.eq([{ cat: 'dog' }], Option.some({ cat: 'dog' }).toArray());
      assert.eq([[ 1 ]], Option.some([1]).toArray());

      var plus2 = function(a) { return a + 2; };
      assert.eq(true, Option.some(5).ap(Option.some(plus2)).equals(Option.some(7)));
      assert.eq(true, Option.some(5).ap(Option.none()).equals(Option.none()));

      var person = function (name) {
        return function (age) {
          return function (address) {
            return { name: name, age: age, address: address };
          };
        };
      };

      assert.eq({name:'bob', age:25, address:'the moon'}, Option.some('the moon').ap(Option.some(25).ap(Option.some('bob').map(person))).getOrDie());

      assert.eq(true, Option.some(6).or(Option.some(7)).equals(Option.some(6)));
      assert.eq(true, Option.some(3).or(Option.none()).equals(Option.some(3)));

      var assertOptionEq = function(expected, actual) {
        var same = expected.isNone() ? actual.isNone() : (actual.isSome() && expected.getOrDie() === actual.getOrDie());
        if (!same) {
          // assumes toString() works
          assert.fail('Expected: ' + expected.toString() + ' Actual: ' + actual.toString());
        }
      };

      assertOptionEq(Option.some(6), Option.some(6).filter(function(x) { return x === 6; }));
      assertOptionEq(Option.some(6), Option.some(6).filter(Fun.constant(true)));

      assert.eq('a', Option.some('a').fold(Fun.die('boom'), Fun.identity));
      assert.eq(['z'], Option.some('z').fold(Fun.die('boom'), function () { return Array.prototype.slice.call(arguments); }));
      assert.eq('az', Option.some('a').fold(Fun.die('boom'), function(x) { return x + 'z'; }));
    };

    var testSpecs = function () {
      var arbOptionSome = ArbDataTypes.optionSome;

      Jsc.property('Checking some(x).fold(die, id) === x', 'json', function (json) {
        var opt = Option.some(json);
        var actual = opt.fold(Fun.die('Should not be none!'), Fun.identity);
        return Jsc.eq(json, actual);
      });

      return;

      Jsc.property('Checking none.is === false', arbOptionSome, function (opt) {
        var v = opt.fold(Fun.identity, Fun.die('should be option.none'));
        return Jsc.eq(false, opt.is(v));
      });

      Jsc.property('Checking none.isSome === false', arbOptionSome, function (opt) {
        return Jsc.eq(false, opt.isSome());
      });      

      Jsc.property('Checking none.isNone === true', arbOptionSome, function (opt) {
        return Jsc.eq(true, opt.isNone());
      });
  
      Jsc.property('Checking none.getOr(v) === v', arbOptionSome, 'json', function (opt, json) {
        return Jsc.eq(json, opt.getOr(json));
      });

      Jsc.property('Checking none.getOrThunk(_ -> v) === v', arbOptionSome, Jsc.fun(Jsc.json), function (opt, thunk) {
        return Jsc.eq(thunk(), opt.getOrThunk(thunk));
      });

      // Require non empty string of msg falsiness gets in the way.
      Jsc.property('Checking none.getOrDie() always throws', arbOptionSome, Jsc.nestring, function (opt, s) {
        try {
          opt.getOrDie(s);
          return false;
        } catch (err) {
          return Jsc.eq(s, err.message);
        }
      });

      Jsc.property('Checking none.or(oSomeValue) === oSomeValue', arbOptionSome, 'json', function (opt, json) {
        var output = opt.or(Option.some(json));
        return Jsc.eq(true, output.is(json));
      });      

      Jsc.property('Checking none.orThunk(_ -> v) === v', arbOptionSome, 'json', function (opt, json) {
        var output = opt.orThunk(function () {
          return Option.some(json);
        });
        return Jsc.eq(true, output.is(json));
      });     

      Jsc.property('Checking none.map(f) === none', arbOptionSome, 'string -> json', function (opt, f) {
        var actual = opt.map(f);
        return Jsc.eq(true, actual.isNone());
      });

      Jsc.property('Checking none.ap(Option.some(string -> json) === none', arbOptionSome, 'string -> json', function (opt, f) {
        var g = Option.some(f);
        var actual = opt.ap(g);
        return Jsc.eq(true, actual.isNone());
      });

      Jsc.property('Checking none.each(f) === undefined and f does not fire', arbOptionSome, 'string -> json', function (opt, f) {
        var actual = opt.each(Fun.die('should not invoke'));
        return Jsc.eq(undefined, actual);
      });

      Jsc.property('Given f :: s -> some(b), checking none.bind(f) === none', arbOptionSome, Jsc.fn(arbOptionSome), function (opt, f) {
        var actual = opt.bind(f);
        return Jsc.eq(true, actual.isNone());
      });

      Jsc.property('Given f :: s -> none, checking none.bind(f) === none', arbOptionSome, Jsc.fn(arbOptionNone), function (opt, f) {
        var actual = opt.bind(f);
        return Jsc.eq(true, actual.isNone());
      });

      Jsc.property('Checking none.flatten === none', arbOptionSome, function (opt) {
        return Jsc.eq(true, opt.flatten().isNone());
      });

      Jsc.property('Checking none.exists === false', arbOptionSome, 'string -> bool', function (opt, f) {
        return Jsc.eq(false, opt.exists(f));
      });

      Jsc.property('Checking none.forall === true', arbOptionSome, 'string -> bool', function (opt, f) {
        return Jsc.eq(true, opt.forall(f));
      });

      Jsc.property('Checking none.filter(f) === none', arbOptionSome, Jsc.fun(Jsc.bool), function (opt, f) {
        return Jsc.eq(true, opt.filter(f).isNone());
      });

      Jsc.property('Checking none.equals(none) === true', arbOptionSome, arbOptionNone, function (opt1, opt2) {
        return Jsc.eq(true, opt1.equals(opt2));
      });

      Jsc.property('Checking none.equals_(none) === true', arbOptionSome, arbOptionNone, function (opt1, opt2) {
        return Jsc.eq(true, opt1.equals_(opt2));
      });

      Jsc.property('Checking none.toArray equals [ ]', arbOptionSome, function (opt) {
        return Jsc.eq([ ], opt.toArray());
      });

      Jsc.property('Checking none.toString equals "none()"', arbOptionSome, function (opt) {
        return Jsc.eq('none()', opt.toString());
      });
    };

    testSanity();
    testSpecs();
  }
);