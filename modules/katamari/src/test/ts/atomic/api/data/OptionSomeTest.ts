import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionSomeTest', function() {
  const testSanity = function () {
    const boom = function(f?) { throw 'Should not be called'; };

    const s = Option.some(5);   
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

    const comparator = function(a, b) { return Math.round(a) === Math.round(b); };

    assert.eq(true, Option.some(5.1).equals_(Option.some(5.3), comparator));
    assert.eq(false, Option.some(5.1).equals_(Option.some(5.9), comparator));

    assert.eq([1], Option.some(1).toArray());
    assert.eq([{ cat: 'dog' }], Option.some({ cat: 'dog' }).toArray());
    assert.eq([[ 1 ]], Option.some([1]).toArray());

    const plus2 = function(a) { return a + 2; };
    assert.eq(true, Option.some(5).ap(Option.some(plus2)).equals(Option.some(7)));
    assert.eq(true, Option.some(5).ap(Option.none()).equals(Option.none()));

    const person = function (name) {
      return function (age) {
        return function (address) {
          return { name: name, age: age, address: address };
        };
      };
    };

    assert.eq({name:'bob', age:25, address:'the moon'}, Option.some('the moon').ap(Option.some(25).ap(Option.some('bob').map(person))).getOrDie());

    assert.eq(true, Option.some(6).or(Option.some(7)).equals(Option.some(6)));
    assert.eq(true, Option.some(3).or(Option.none()).equals(Option.some(3)));

    const assertOptionEq = function(expected, actual) {
      const same = expected.isNone() ? actual.isNone() : (actual.isSome() && expected.getOrDie() === actual.getOrDie());
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

  const testSpecs = function () {
    const arbOptionSome = ArbDataTypes.optionSome;
    const arbOptionNone = ArbDataTypes.optionNone;


    Jsc.property('Checking some(x).fold(die, id) === x', 'json', function (json) {
      const opt = Option.some(json);
      const actual = opt.fold(Fun.die('Should not be none!'), Fun.identity);
      return Jsc.eq(json, actual);
    });


    Jsc.property('Checking some(x).is(x) === true', 'json', function (json) {
      const opt = Option.some(json);
      return Jsc.eq(true, opt.is(json));
    });

    Jsc.property('Checking some(x).isSome === true', arbOptionSome, function (opt) {
      return Jsc.eq(true, opt.isSome());
    });      

    Jsc.property('Checking some(x).isNone === false', arbOptionSome, function (opt) {
      return Jsc.eq(false, opt.isNone());
    });

    Jsc.property('Checking some(x).getOr(v) === x', arbOptionSome, 'json', 'json', function (json1, json2) {
      return Jsc.eq(json1, Option.some(json1).getOr(json2));
    });

    
    Jsc.property('Checking some(x).getOrThunk(_ -> v) === x', 'json', Jsc.fun(Jsc.json), function (json1, thunk) {
      return Jsc.eq(json1, Option.some(json1).getOrThunk(thunk));
    });

    // Require non empty string of msg falsiness gets in the way.
    Jsc.property('Checking some.getOrDie() never throws', 'json', Jsc.nestring, function (json, s) {
      try {
        const opt = Option.some(json);
        opt.getOrDie(s);
        return Jsc.eq(json, opt.getOrDie(s));
      } catch (err) {
        return 'Should not throw error: ' + err;
      }
    });

    Jsc.property('Checking some(x).or(oSomeValue) === some(x)', 'json', arbOptionSome, function (json, other) {
      const output = Option.some(json).or(other);
      return Jsc.eq(true, output.is(json));
    });      

    Jsc.property('Checking some(x).orThunk(_ -> oSomeValue) === some(x)', 'json', arbOptionSome, function (json, other) {
      const output = Option.some(json).orThunk(function () {
        return other;
      });
      return Jsc.eq(true, output.is(json));
    });     

    Jsc.property('Checking some(x).map(f) === some(f(x))', 'json', 'json -> json', function (json, f) {
      const opt = Option.some(json);
      const actual = opt.map(f);
      return Jsc.eq(f(json), actual.getOrDie());
    });

    Jsc.property('Checking some(x).ap(Option.some(f) === some(f(x))', 'json', 'string -> json', function (json, f) {
      const opt = Option.some(json);
      const g = Option.some(f);
      const actual = opt.ap(g);
      return Jsc.eq(f(json), actual.getOrDie());
    });      

    Jsc.property('Checking some(x).each(f) === undefined and f gets x', arbOptionSome, function (opt) {
      let hack = null;
      const actual = opt.each(function (x) {
        hack = x;
      });
      return Jsc.eq(undefined, actual) && hack == opt.getOrDie();
    });

    Jsc.property('Given f :: s -> some(b), checking some(x).bind(f) === some(b)', arbOptionSome, Jsc.fn(arbOptionSome), function (opt, f) {
      const actual = opt.bind(f);
      return actual.isSome() && Jsc.eq(true, actual.equals(f(opt.getOrDie())));
    });

    

    Jsc.property('Given f :: s -> none, checking some(x).bind(f) === none', arbOptionSome, Jsc.fn(arbOptionNone), function (opt, f) {
      const actual = opt.bind(f);
      return Jsc.eq(true, actual.isNone());
    });



    Jsc.property('Checking some(none).flatten === none', arbOptionNone, function (inside) {
      const opt = Option.some(inside);
      return Jsc.eq(true, opt.flatten().isNone());
    });

    Jsc.property('Checking some(some(y)).flatten === none', arbOptionSome, function (inside) {
      const opt = Option.some(inside);
      return Jsc.eq(inside.getOrDie(), opt.flatten().getOrDie());
    });

    Jsc.property('Checking some(x).exists(_ -> false) === false', arbOptionSome, function (opt) {
      return Jsc.eq(false, opt.exists(Fun.constant(false)));
    });

    Jsc.property('Checking some(x).exists(_ -> true) === true', arbOptionSome, function (opt) {
      return Jsc.eq(true, opt.exists(Fun.constant(true)));
    });

    Jsc.property('Checking some(x).exists(f) iff. f(x)', 'json', Jsc.fun(Jsc.bool), function (json, f) {
      const opt = Option.some(json);
      return f(json) === true ? Jsc.eq(true, opt.exists(f)) : Jsc.eq(false, opt.exists(f));
    });

    Jsc.property('Checking some(x).forall(_ -> false) === false', arbOptionSome, function (opt) {
      return Jsc.eq(false, opt.forall(Fun.constant(false)));
    });

    Jsc.property('Checking some(x).forall(_ -> true) === true', arbOptionSome, function (opt) {
      return Jsc.eq(true, opt.forall(Fun.constant(true)));
    });

    Jsc.property('Checking some(x).forall(f) iff. f(x)', 'json', Jsc.fun(Jsc.bool), function (json, f) {
      const opt = Option.some(json);
      return f(json) === true ? Jsc.eq(true, opt.forall(f)) : Jsc.eq(false, opt.forall(f));
    });

    Jsc.property('Checking some(x).filter(_ -> false) === none', arbOptionSome, function (opt) {
      return Jsc.eq(true, opt.filter(Fun.constant(false)).isNone());
    });

    Jsc.property('Checking some(x).filter(_ -> true) === some(x)', arbOptionSome, function (opt) {
      return Jsc.eq(opt.getOrDie(), opt.filter(Fun.constant(true)).getOrDie());
    });

    Jsc.property('Checking some(x).filter(f) === some(x) iff. f(x)', 'json', Jsc.fun(Jsc.bool), function (json, f) {
      const opt = Option.some(json);
      return f(json) === true ? Jsc.eq(json, opt.filter(f).getOrDie()) : Jsc.eq(true, opt.filter(f).isNone());
    });

    Jsc.property('Checking some(x).equals(none) === false', arbOptionSome, arbOptionNone, function (opt1, opt2) {
      return Jsc.eq(false, opt1.equals(opt2));
    });

    Jsc.property('Checking some(x).equals(some(y)) iff. x === y', arbOptionSome, arbOptionSome, function (json1, json2) {
      const opt1 = Option.some(json1);
      const opt2 = Option.some(json2);
      return json1 === json2 ? opt1.equals(opt2) : !opt1.equals(opt2);
    });

    Jsc.property('Checking some(x).equals_(none, _ -> false) === false', arbOptionSome, arbOptionNone, function (opt1, opt2) {
      return Jsc.eq(false, opt1.equals_(opt2, Fun.constant(false)));
    });

    Jsc.property('Checking some(x).equals_(none, _, _ -> true) === false', arbOptionSome, arbOptionNone, function (opt1, opt2) {
      return Jsc.eq(false, opt1.equals_(opt2, Fun.constant(true)));
    });

    Jsc.property('Checking some(x).equals_(some(y), _, _ -> false) === false', arbOptionSome, arbOptionSome, function (opt1, opt2) {
      return Jsc.eq(false, opt1.equals_(opt2, Fun.constant(false)));
    });

    Jsc.property('Checking some(x).equals_(some(y), _, _ -> true) === true', 'json', 'json', function (json1, json2) {
      const opt1 = Option.some(json1);
      const opt2 = Option.some(json2);
      return Jsc.eq(true, opt1.equals_(opt2, Fun.constant(true)));
    });

    Jsc.property('Checking some(x).equals_(some(y), f) iff. f(x, y)', arbOptionSome, arbOptionSome, 'json, json -> bool', function (json1, json2, f) {
      const opt1 = Option.some(json1);
      const opt2 = Option.some(json2);
      return f(json1, json2) ? opt1.equals_(opt2, f) : !opt1.equals_(opt2, f);
    });

    Jsc.property('Checking some(x).toArray equals [ x ]', 'json', function (json) {
      return Jsc.eq([ json ], Option.some(json).toArray());
    });

    Jsc.property('Checking some(x).toString equals "some(x)"', 'json', function (json) {
      return Jsc.eq('some(' + json + ')', Option.some(json).toString());
    });
  };

  testSanity();
  testSpecs();
});

