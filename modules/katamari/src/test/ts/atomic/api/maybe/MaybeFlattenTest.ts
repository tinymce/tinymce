import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Maybe } from 'ephox/katamari/api/Maybe';

const { just, nothing } = Maybe;

UnitTest.test('Maybe.flatten: unit tests', () => {
  Assert.eq('nothing', nothing, Maybe.flatten(nothing));
  Assert.eq('just(nothing)', nothing, Maybe.flatten(just(nothing)));
  Assert.eq('just(just)', just('meow'), Maybe.flatten(just(just<string>('meow'))));
});

UnitTest.test('Maybe.flatten: just(just(x))', () => {
  fc.assert(fc.property(fc.integer(), function (n) {
    Assert.eq('eq', just(n), Maybe.flatten(just(just(n))));
  }));
});
