import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import Jsc from '@ephox/wrap-jsverify';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

const { tNumber } = Testable;

UnitTest.test('OptionNoneTest', () => {

  const testSanity = () => {
    const s = Option.none<number>();
    Assert.eq('none is not some', false, s.isSome());
    Assert.eq('none is none', true, s.isNone());
    Assert.eq('getOr', 6, s.getOr(6));
    Assert.eq('getOrThunk', 6, s.getOrThunk(() => 6));
    Assert.throws('getOrDie dies', () => { s.getOrDie('Died!'); });
    Assert.eq('or', 6, s.or(Option.some(6)).getOrDie());
    Assert.eq('orThunk', 6, s.orThunk(() => Option.some(6)).getOrDie());

    Assert.eq('map is none', true, s.map((v) => v * 2).isNone());
    Assert.eq('map bottom is none', true, s.map(Fun.die('boom')).isNone());

    Assert.eq('bind none some is none', true, s.bind((v) => Option.some('test' + v)).isNone());

    Assert.eq('from null is none', false, Option.from(null).isSome());
    Assert.eq('from undefined is none', false, Option.from(undefined).isSome());

    Assert.eq('none or some(7) is some(s)', true, Option.none().or(Option.some(7)).equals(Option.some(7)));
    Assert.eq('none or none is none', true, Option.none().or(Option.none()).equals(Option.none()));

    Assert.eq('none to array is empty array', [], Option.none().toArray());

    Assert.eq('fold #1', 'zz', Option.none().fold(() => 'zz', Fun.die('boom')));
    Assert.eq('fold #2', [], Option.none().fold(function () { return Array.prototype.slice.call(arguments); }, Fun.die('boom')));

    Assert.eq('fold #3', 'b', Option.none().fold(Fun.constant('b'), Fun.die('boom')));
    Assert.eq('bind', true, Option.none().bind(Fun.die('boom')).isNone());
    Assert.eq('each', undefined, Option.none().each(Fun.die('boom')));

    Assert.eq('forall none is true', true, Option.none().forall(Fun.die('boom')));
    Assert.eq('exists none is false', false, Option.none().exists(Fun.die('boom')));

    Assert.eq('toString', 'none()', Option.none().toString());
  };

  const testSpecs = () => {
    Jsc.property('Checking none.fold(_ -> x, die) === x', 'json', (json: any) => {
      const actual = Option.none<string>().fold(Fun.constant(json), Fun.die('Should not die'));
      return Jsc.eq(json, actual);
    });

    Jsc.property('Checking none.is === false', 'json', (v: any) =>
      Jsc.eq(false, Option.none<any>().is(v)));

    Jsc.property('Checking none.getOr(v) === v', 'json', (json: any) => Jsc.eq(json, Option.none<any>().getOr(json)));

    Jsc.property('Checking none.getOrThunk(_ -> v) === v', Jsc.fun(Jsc.json),
      (thunk: () => any) => Jsc.eq(thunk(), Option.none<any>().getOrThunk(thunk)));

    // Require non empty string of msg falsiness gets in the way.
    Jsc.property('Checking none.getOrDie() always throws', Jsc.nestring, (s) => {
      try {
        Option.none().getOrDie(s);
        return false;
      } catch (err) {
        return Jsc.eq(s, err.message);
      }
    });

    Jsc.property('Checking none.or(oSomeValue) === oSomeValue', 'json', (json) => {
      const output = Option.none().or(Option.some(json));
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking none.orThunk(_ -> v) === v', 'json', (json) => {
      const output = Option.none().orThunk(() => Option.some(json));
      return Jsc.eq(true, output.is(json));
    });
  };

  testSanity();
  testSpecs();
});
