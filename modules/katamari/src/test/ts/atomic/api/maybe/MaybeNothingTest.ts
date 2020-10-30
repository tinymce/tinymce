import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Maybes from 'ephox/katamari/api/Maybes';

const { just, nothing } = Maybes;

UnitTest.test('Maybes.nothing: unit tests', () => {
  const s = nothing;
  Assert.throws('getOrDie dies', () => {
    Maybes.getOrDie(s);
  });
  Assert.eq('or', 6, Maybes.getOrDie(Maybes.or(s, just(6))));
  Assert.eq('orThunk', 6, Maybes.getOrDie(Maybes.orThunk(s, () => just(6))));

  Assert.eq('map is nothing', nothing, Maybes.map(s, (v: number) => v * 2));
  Assert.eq('map bottom is nothing', nothing, Maybes.map(s, Fun.die('boom')));

  Assert.eq('bind nothing just is nothing', nothing, Maybes.bind(s, (v) => just('test' + v)));

  Assert.eq('from null is nothing', nothing, Maybes.from(null));
  Assert.eq('from undefined is nothing', nothing, Maybes.from(undefined));

  Assert.eq('nothing or just(7) is just(s)', true, Maybes.equals(Maybes.or(nothing, just(7)), just(7)));
  Assert.eq('nothing or nothing is nothing', true, Maybes.equals(Maybes.or(nothing, nothing), nothing));

  Assert.eq('nothing to array is empty array', [], Maybes.toArr(nothing));

  Assert.eq('bind', nothing, Maybes.bind(nothing, Fun.die('boom')));
  Assert.eq('each', undefined, Maybes.each(nothing, Fun.die('boom')));

  Assert.eq('forAll nothing is true', true, Maybes.forAll(nothing, Fun.die('boom')));
  Assert.eq('exists nothing is false', false, Maybes.exists(nothing, Fun.die('boom')));
});

UnitTest.test('Checking is(nothing, _) === false', () => {
  fc.assert(fc.property(fc.integer(), (v) => {
    Assert.eq('nothing is', false, Maybes.is(nothing, v));
  }));
});

UnitTest.test('Checking getOr(nothing, v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', i, Maybes.getOr(nothing, i));
  }));
});

UnitTest.test('Checking getOrThunk(nothing, _ -> v) === v', () => {
  fc.assert(fc.property(fc.func(fc.integer()), (thunk) => {
    Assert.eq('eq', thunk(), Maybes.getOrThunk(nothing, thunk));
  }));
});

UnitTest.test('Checking getOrDie(nothing) always throws', () => {
  Assert.throws('getOrDie', () => {
    Maybes.getOrDie(nothing);
  });
});

UnitTest.test('Checking or(nothing, oSomeValue) === oSomeValue', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Maybes.or(nothing, just(i));
    Assert.eq('eq', true, Maybes.is(output, i));
  }));
});

UnitTest.test('Checking orThunk(nothing, _ -> v) === v', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const output = Maybes.orThunk(nothing, () => just(i));
    Assert.eq('eq', true, Maybes.is(output, i));
  }));
});
