import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionNoneTest', function () {
  const testSanity = function () {
    const s = Option.none();
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

    const assertOptionEq = function (expected, actual) {
      const same = expected.isNone() ? actual.isNone() : (actual.isSome() && expected.getOrDie() === actual.getOrDie());
      if (!same) {
        // assumes toString() works
        assert.fail('Expected: ' + expected.toString() + ' Actual: ' + actual.toString());
      }
    };

    assertOptionEq(Option.none(), Option.some(5).filter(function (x) { return x === 8; }));
    assertOptionEq(Option.none(), Option.some(5).filter(Fun.constant(false)));
    assertOptionEq(Option.none(), Option.none().filter(Fun.die('boom')));

    assert.eq('zz', Option.none().fold(function () { return 'zz'; }, Fun.die('boom')));
    assert.eq([], Option.none().fold(function () { return Array.prototype.slice.call(arguments); }, Fun.die('boom')));
    assert.eq('b', Option.none().fold(Fun.constant('b'), Fun.die('boom')));
  };

  const testSpecs = function () {
    const arbOptionNone = ArbDataTypes.optionNone;
    const arbOptionSome = ArbDataTypes.optionSome;
    const arbOption = ArbDataTypes.option;

    Jsc.property('Checking none.fold(_ -> x, die) === x', arbOptionNone, 'json', function (opt, json) {
      const actual = opt.fold(Fun.constant(json), Fun.die('Should not die'));
      return Jsc.eq(json, actual);
    });

    Jsc.property('Checking none.is === false', arbOptionNone, function (opt) {
      const v = opt.fold(Fun.identity, Fun.die('should be option.none'));
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

    Jsc.property('Checking none.getOrThunk(_ -> v) === v', arbOptionNone, Jsc.fun(Jsc.json), function (opt, thunk) {
      return Jsc.eq(thunk(), opt.getOrThunk(thunk));
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

    Jsc.property('Checking none.or(oSomeValue) === oSomeValue', arbOptionNone, 'json', function (opt, json) {
      const output = opt.or(Option.some(json));
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking none.orThunk(_ -> v) === v', arbOptionNone, 'json', function (opt, json) {
      const output = opt.orThunk(function () {
        return Option.some(json);
      });
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking none.map(f) === none', arbOptionNone, 'string -> json', function (opt, f) {
      const actual = opt.map(f);
      return Jsc.eq(true, actual.isNone());
    });

    Jsc.property('Checking none.ap(Option.some(string -> json) === none', arbOptionNone, 'string -> json', function (opt, f) {
      const g = Option.some(f);
      const actual = opt.ap(g);
      return Jsc.eq(true, actual.isNone());
    });

    Jsc.property('Checking none.each(f) === undefined and f does not fire', arbOptionNone, 'string -> json', function (opt, f) {
      const actual = opt.each(Fun.die('should not invoke'));
      return Jsc.eq(undefined, actual);
    });

    Jsc.property('Given f :: s -> some(b), checking none.bind(f) === none', arbOptionNone, Jsc.fn(arbOptionSome), function (opt, f) {
      const actual = opt.bind(f);
      return Jsc.eq(true, actual.isNone());
    });

    Jsc.property('Given f :: s -> none, checking none.bind(f) === none', arbOptionNone, Jsc.fn(arbOptionNone), function (opt, f) {
      const actual = opt.bind(f);
      return Jsc.eq(true, actual.isNone());
    });

    Jsc.property('Checking none.flatten === none', arbOptionNone, function (opt) {
      return Jsc.eq(true, opt.flatten().isNone());
    });

    Jsc.property('Checking none.exists === false', arbOptionNone, 'string -> bool', function (opt, f) {
      return Jsc.eq(false, opt.exists(f));
    });

    Jsc.property('Checking none.forall === true', arbOptionNone, 'string -> bool', function (opt, f) {
      return Jsc.eq(true, opt.forall(f));
    });

    Jsc.property('Checking none.filter(f) === none', arbOptionNone, Jsc.fun(Jsc.bool), function (opt, f) {
      return Jsc.eq(true, opt.filter(f).isNone());
    });

    Jsc.property('Checking none.equals(none) === true', arbOptionNone, arbOptionNone, function (opt1, opt2) {
      return Jsc.eq(true, opt1.equals(opt2));
    });

    Jsc.property('Checking none.equals_(none) === true', arbOptionNone, arbOptionNone, function (opt1, opt2) {
      return Jsc.eq(true, opt1.equals_(opt2));
    });

    Jsc.property('Checking none.toArray equals [ ]', arbOptionNone, function (opt) {
      return Jsc.eq([ ], opt.toArray());
    });

    Jsc.property('Checking none.toString equals "none()"', arbOptionNone, function (opt) {
      return Jsc.eq('none()', opt.toString());
    });
  };

  testSanity();
  testSpecs();
});
