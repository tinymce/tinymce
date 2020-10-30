import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Maybe } from 'ephox/katamari/api/Maybe';
import { tMaybe } from 'ephox/katamari/api/MaybeInstances';

const { just, nothing } = Maybe;

UnitTest.test('Maybe.nothing: unit tests', () => {
  const s = nothing;
  Assert.throws('getOrDie dies', () => {
    Maybe.getOrDie(s);
  });
  Assert.eq('or', 6, Maybe.getOrDie(Maybe.or(s, just(6))));
  Assert.eq('orThunk', 6, Maybe.getOrDie(Maybe.orThunk(s, () => just(6))));

  Assert.eq('map is nothing', nothing, Maybe.map(s, (v: number) => v * 2), tMaybe());
  Assert.eq('map bottom is nothing', nothing, Maybe.map(s, Fun.die('boom')), tMaybe());

  Assert.eq('bind nothing just is nothing', nothing, Maybe.bind(s, (v) => just('test' + v)), tMaybe());

  Assert.eq('from null is nothing', nothing, Maybe.from(null), tMaybe());
  Assert.eq('from undefined is nothing', nothing, Maybe.from(undefined), tMaybe());

  Assert.eq('nothing or just(7) is just(s)', true, Maybe.equals(Maybe.or(nothing, just(7)), just(7)));
  Assert.eq('nothing or nothing is nothing', true, Maybe.equals(Maybe.or(nothing, nothing), nothing));

  Assert.eq('nothing to array is empty array', [], Maybe.toArr(nothing));

  Assert.eq('bind', nothing, Maybe.bind(nothing, Fun.die('boom')), tMaybe());
  Assert.eq('each', undefined, Maybe.each(nothing, Fun.die('boom')));

  Assert.eq('forAll nothing is true', true, Maybe.forAll(nothing, Fun.die('boom')));
  Assert.eq('exists nothing is false', false, Maybe.exists(nothing, Fun.die('boom')));
});

UnitTest.test('Checking is(nothing, _) === false', () => {
  fc.assert(fc.property(fc.integer(), (v) => {
    Assert.eq('nothing is', false, Maybe.is(nothing, v));
  }));
});

UnitTest.test('Checking getOr(nothing, v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', i, Maybe.getOr(nothing, i));
  }));
});

UnitTest.test('Checking getOrThunk(nothing, _ -> v) === v', () => {
  fc.assert(fc.property(fc.func(fc.integer()), (thunk) => {
    Assert.eq('eq', thunk(), Maybe.getOrThunk(nothing, thunk));
  }));
});

UnitTest.test('Checking getOrDie(nothing) always throws', () => {
  Assert.throws('getOrDie', () => {
    Maybe.getOrDie(nothing);
  });
});

UnitTest.test('Checking or(nothing, oSomeValue) === oSomeValue', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Maybe.or(nothing, just(i));
    Assert.eq('eq', true, Maybe.is(output, i));
  }));
});

UnitTest.test('Checking orThunk(nothing, _ -> v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Maybe.orThunk(nothing, () => just(i));
    Assert.eq('eq', true, Maybe.is(output, i));
  }));
});
