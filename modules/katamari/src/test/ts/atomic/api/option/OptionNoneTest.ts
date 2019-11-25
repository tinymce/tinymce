import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import fc from 'fast-check';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

const { tNumber } = Testable;

UnitTest.test('Option.none: unit tests', () => {
  const s = Option.none<number>();
  Assert.throws('getOrDie dies', () => {
    s.getOrDie('Died!');
  });
  Assert.eq('or', 6, s.or(Option.some(6)).getOrDie());
  Assert.eq('orThunk', 6, s.orThunk(() => Option.some(6)).getOrDie());

  Assert.eq('map is none', Option.none(), s.map((v) => v * 2), tOption());
  Assert.eq('map bottom is none', Option.none(), s.map(Fun.die('boom')), tOption());

  Assert.eq('bind none some is none', Option.none(), s.bind((v) => Option.some('test' + v)), tOption());

  Assert.eq('from null is none', Option.none(), Option.from(null), tOption());
  Assert.eq('from undefined is none', Option.none(), Option.from(undefined), tOption());

  Assert.eq('none or some(7) is some(s)', true, Option.none().or(Option.some(7)).equals(Option.some(7)));
  Assert.eq('none or none is none', true, Option.none().or(Option.none()).equals(Option.none()));

  Assert.eq('none to array is empty array', [], Option.none().toArray());

  Assert.eq('fold #1', 'zz', Option.none().fold(() => 'zz', Fun.die('boom')));
  Assert.eq('fold #2', [], Option.none().fold(function () {
    return Array.prototype.slice.call(arguments);
  }, Fun.die('boom')));

  Assert.eq('fold #3', 'b', Option.none().fold(Fun.constant('b'), Fun.die('boom')));
  Assert.eq('bind', Option.none(), Option.none().bind(Fun.die('boom')), tOption());
  Assert.eq('each', undefined, Option.none().each(Fun.die('boom')));

  Assert.eq('forall none is true', true, Option.none().forall(Fun.die('boom')));
  Assert.eq('exists none is false', false, Option.none().exists(Fun.die('boom')));

  Assert.eq('toString', 'none()', Option.none().toString());
});

UnitTest.test('Checking none.fold(_ -> x, die) === x', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const actual = Option.none<string>().fold(Fun.constant(i), Fun.die('Should not die'));
    Assert.eq('eq', i, actual);
  }));
});

UnitTest.test('Checking none.is === false', () => {
  fc.assert(fc.property(fc.integer(), (v) => {
    Assert.eq('none is', false, Option.none<number>().is(v));
  }));
});

UnitTest.test('Checking none.getOr(v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', i, Option.none<any>().getOr(i));
  }));
});

UnitTest.test('Checking none.getOrThunk(_ -> v) === v', () => {
  fc.assert(fc.property(fc.func(fc.integer()), (thunk) => {
    Assert.eq('eq', thunk(), Option.none<number>().getOrThunk(thunk));
  }));
});

UnitTest.test('Checking none.getOrDie() always throws', () => {
  // Require non empty string of msg falsiness gets in the way.
  fc.assert(fc.property(fc.string(1, 40), (s) => {
    Assert.throws('getOrDie', () => {
      Option.none().getOrDie(s);
    });
  }));
});

UnitTest.test('Checking none.or(oSomeValue) === oSomeValue', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Option.none().or(Option.some(i));
    Assert.eq('eq', true, output.is(i));
  }));
});

UnitTest.test('Checking none.orThunk(_ -> v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Option.none().orThunk(() => Option.some(i));
    Assert.eq('eq', true, output.is(i));
  }));
});
