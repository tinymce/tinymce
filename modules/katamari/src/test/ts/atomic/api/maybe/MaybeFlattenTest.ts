import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Maybe from 'ephox/katamari/api/Maybe';
import { tMaybe } from 'ephox/katamari/api/MaybeInstances';

const { just, nothing } = Maybe;

UnitTest.test('Maybe.flatten: unit tests', () => {
  Assert.eq('nothing', nothing, Maybe.flatten(nothing), tMaybe());
  Assert.eq('just(nothing)', nothing, Maybe.flatten(just(nothing)), tMaybe());
  Assert.eq('just(just)', just('meow'), Maybe.flatten(just(just<string>('meow'))), tMaybe());
});

UnitTest.test('Maybe.flatten: just(just(x))', () => {
  fc.assert(fc.property(fc.integer(), function (n) {
    Assert.eq('eq', just(n), Maybe.flatten(just(just(n))), tMaybe());
  }));
});
