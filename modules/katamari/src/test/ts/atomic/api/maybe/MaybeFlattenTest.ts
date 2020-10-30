import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Maybes from 'ephox/katamari/api/Maybes';

const { just, nothing } = Maybes;

UnitTest.test('Maybes.flatten: unit tests', () => {
  Assert.eq('nothing', nothing, Maybes.flatten(nothing));
  Assert.eq('just(nothing)', nothing, Maybes.flatten(just(nothing)));
  Assert.eq('just(just)', just('meow'), Maybes.flatten(just(just<string>('meow'))));
});

UnitTest.test('Maybes.flatten: just(just(x))', () => {
  fc.assert(fc.property(fc.integer(), function (n) {
    Assert.eq('eq', just(n), Maybes.flatten(just(just(n))));
  }));
});
