import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Maybe } from 'ephox/katamari/api/Maybe';
import * as Fun from 'ephox/katamari/api/Fun';

const { just, nothing } = Maybe;

UnitTest.test('Optional.getOr', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('none', x, Maybe.getOr(nothing, x));
    Assert.eq('none', x, Maybe.getOrThunk(nothing, () => x));
  }));
  fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
    Assert.eq('some', x, Maybe.getOr(just(x), y));
    Assert.eq('some', x, Maybe.getOrThunk(just(x), Fun.die('boom')));
  }));
});
