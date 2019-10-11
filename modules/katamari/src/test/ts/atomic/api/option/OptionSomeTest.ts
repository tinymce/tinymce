import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

const { tNumber, tString } = Testable;

UnitTest.test('OptionSomeTest', () => {
  const testSanity = () => {
    const boom = () => { throw new Error('Should not be called'); };

    const s = Option.some(5);
    Assert.eq('some is some', true, s.isSome());
    Assert.eq('some is not none', false, s.isNone());
    Assert.eq('getOr', 5, s.getOr(6));
    Assert.eq('getOrThunk', 5, s.getOrThunk(() => 6));
    Assert.eq('getOrDie', 5, s.getOrDie('Died!'));
    Assert.eq('or', Option.some(5), s.or(Option.some(6)), tOption(tNumber));
    Assert.eq('orThunk', Option.some(5), s.orThunk(boom), tOption(tNumber));

    Assert.eq('map', 10, s.map((v) => v * 2).getOrDie());

    Assert.eq('bind', Option.some('test5'), s.bind((v) => Option.some('test' + v)), tOption(tString));

    Assert.eq('from', Option.some(5), Option.from(5), tOption(tNumber));

    Assert.eq('toArray 1', [1], Option.some(1).toArray());
    Assert.eq('toArray 2', [{ cat: 'dog' }], Option.some({ cat: 'dog' }).toArray());
    Assert.eq('toArray 3', [[ 1 ]], Option.some([1]).toArray());

    Assert.eq('or some', true, Option.some(6).or(Option.some(7)).equals(Option.some(6)));
    Assert.eq('or none', true, Option.some(3).or(Option.none()).equals(Option.some(3)));

    Assert.eq('fold 1', 11, s.fold(boom, (v) => v + 6));
    Assert.eq('fold 2', 'a', Option.some('a').fold(Fun.die('boom'), Fun.identity));
    Assert.eq('fold 3', ['z'], Option.some('z').fold(Fun.die('boom'), function () { return Array.prototype.slice.call(arguments); }));
    Assert.eq('fold 4', 'az', Option.some('a').fold(Fun.die('boom'), (x) => x + 'z'));
  };

  const testSpecs = () => {
    const arbOptionSome = ArbDataTypes.optionSome;
    const arbOptionNone = ArbDataTypes.optionNone;

    Jsc.property('Checking some(x).fold(die, id) === x', 'json', (json) => {
      const opt = Option.some(json);
      const actual = opt.fold(Fun.die('Should not be none!'), Fun.identity);
      return Jsc.eq(json, actual);
    });

    Jsc.property('Checking some(x).is(x) === true', 'json', (json) => {
      const opt = Option.some(json);
      return Jsc.eq(true, opt.is(json));
    });

    Jsc.property('Checking some(x).isSome === true', arbOptionSome, (opt) => Jsc.eq(true, opt.isSome()));

    Jsc.property('Checking some(x).isNone === false', arbOptionSome, (opt) => Jsc.eq(false, opt.isNone()));

    Jsc.property('Checking some(x).getOr(v) === x', arbOptionSome, 'json', 'json', (json1, json2) => Jsc.eq(json1, Option.some(json1).getOr(json2)));

    Jsc.property('Checking some(x).getOrThunk(_ -> v) === x', 'json', Jsc.fun(Jsc.json), (json1, thunk) => Jsc.eq(json1, Option.some(json1).getOrThunk(thunk)));

    // Require non empty string of msg falsiness gets in the way.
    Jsc.property('Checking some.getOrDie() never throws', 'json', Jsc.nestring, (json, s) => {
      try {
        const opt = Option.some(json);
        opt.getOrDie(s);
        return Jsc.eq(json, opt.getOrDie(s));
      } catch (err) {
        return 'Should not throw error: ' + err;
      }
    });

    Jsc.property('Checking some(x).or(oSomeValue) === some(x)', 'json', arbOptionSome, (json, other) => {
      const output = Option.some(json).or(other);
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking some(x).orThunk(_ -> oSomeValue) === some(x)', 'json', arbOptionSome, (json, other) => {
      const output = Option.some(json).orThunk(() => other);
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking some(x).map(f) === some(f(x))', 'json', 'json -> json', (json, f) => {
      const opt = Option.some(json);
      const actual = opt.map(f);
      return Jsc.eq(f(json), actual.getOrDie());
    });

    Jsc.property('Checking some(x).each(f) === undefined and f gets x', arbOptionSome, (opt) => {
      let hack = null;
      const actual = opt.each((x) => {
        hack = x;
      });
      return Jsc.eq(undefined, actual) && hack === opt.getOrDie();
    });

    Jsc.property('Given f :: s -> some(b), checking some(x).bind(f) === some(b)', arbOptionSome, Jsc.fn(arbOptionSome), (opt, f) => {
      const actual = opt.bind(f);
      return actual.isSome() && Jsc.eq(true, actual.equals(f(opt.getOrDie())));
    });

    Jsc.property('Given f :: s -> none, checking some(x).bind(f) === none', arbOptionSome, Jsc.fn(arbOptionNone), (opt, f) => {
      const actual = opt.bind(f);
      return Jsc.eq(true, actual.isNone());
    });

    Jsc.property('Checking some(x).exists(_ -> false) === false', arbOptionSome, (opt) => Jsc.eq(false, opt.exists(Fun.constant(false))));

    Jsc.property('Checking some(x).exists(_ -> true) === true', arbOptionSome, (opt) => Jsc.eq(true, opt.exists(Fun.constant(true))));

    Jsc.property('Checking some(x).exists(f) iff. f(x)', 'json', Jsc.fun(Jsc.bool), (json, f) => {
      const opt = Option.some(json);
      return f(json) === true ? Jsc.eq(true, opt.exists(f)) : Jsc.eq(false, opt.exists(f));
    });

    Jsc.property('Checking some(x).forall(_ -> false) === false', arbOptionSome, (opt) => Jsc.eq(false, opt.forall(Fun.constant(false))));

    Jsc.property('Checking some(x).forall(_ -> true) === true', arbOptionSome, (opt) => Jsc.eq(true, opt.forall(Fun.constant(true))));

    Jsc.property('Checking some(x).forall(f) iff. f(x)', 'json', Jsc.fun(Jsc.bool), (json, f) => {
      const opt = Option.some(json);
      return f(json) === true ? Jsc.eq(true, opt.forall(f)) : Jsc.eq(false, opt.forall(f));
    });

    Jsc.property('Checking some(x).toArray equals [ x ]', 'json', (json) => Jsc.eq([json], Option.some(json).toArray()));

    Jsc.property('Checking some(x).toString equals "some(x)"', 'json', (json) => Jsc.eq('some(' + json + ')', Option.some(json).toString()));
  };

  testSanity();
  testSpecs();
});
