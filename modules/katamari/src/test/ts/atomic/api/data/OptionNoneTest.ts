import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('OptionNoneTest', () => {

  const testSanity = () => {
    const s = Option.none<number>();
    assert.eq(false, s.isSome());
    assert.eq(true, s.isNone());
    assert.eq(6, s.getOr(6));
    assert.eq(6, s.getOrThunk(() => 6));
    assert.throws(() => { s.getOrDie('Died!'); });
    assert.eq(6, s.or(Option.some(6)).getOrDie());
    assert.eq(6, s.orThunk(() => Option.some(6)).getOrDie());

    assert.eq(true, s.map((v) => v * 2).isNone());
    assert.eq(true, s.map(Fun.die('boom')).isNone());

    assert.eq(true, s.bind((v) => Option.some('test' + v)).isNone());

    assert.eq(true, s.filter(Fun.constant(true)).isNone());
    assert.eq(true, s.filter(Fun.constant(false)).isNone());
    assert.eq(true, s.filter(Fun.die('oof')).isNone());

    assert.eq(false, Option.from(null).isSome());
    assert.eq(false, Option.from(undefined).isSome());

    assert.eq(true, Option.none().or(Option.some(7)).equals(Option.some(7)));
    assert.eq(true, Option.none().or(Option.none()).equals(Option.none()));

    assert.eq([], Option.none().toArray());

    const assertOptionEq = <T> (expected: Option<T>, actual: Option<T>): void => {
      const same = expected.isNone() ? actual.isNone() : (actual.isSome() && expected.getOrDie() === actual.getOrDie());
      if (!same) {
        // assumes toString() works
        assert.fail('Expected: ' + expected.toString() + ' Actual: ' + actual.toString());
      }
    };

    assertOptionEq(Option.none(), Option.some(5).filter((x) => x === 8));
    assertOptionEq(Option.none(), Option.some(5).filter(Fun.constant(false)));
    assertOptionEq(Option.none(), Option.none().filter(Fun.die('boom')));

    assert.eq('zz', Option.none().fold(() => 'zz', Fun.die('boom')));
    assert.eq([], Option.none().fold(function () { return Array.prototype.slice.call(arguments); }, Fun.die('boom')));

    assert.eq('b', Option.none().fold(Fun.constant('b'), Fun.die('boom')));
    assert.eq(true, Option.none().bind(Fun.die('boom')).isNone());
    assert.eq(undefined, Option.none().each(Fun.die('boom')));
    assert.eq(true, Option.none().filter(Fun.die('boom')).isNone());
    assert.eq(true, Option.none().forall(Fun.die('boom')));
    assert.eq(false, Option.none().exists(Fun.die('boom')));

    assert.eq('none()', Option.none().toString());
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
