import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Maybes from 'ephox/katamari/api/Maybes';
import * as Fun from 'ephox/katamari/api/Fun';

const { just, nothing } = Maybes;

UnitTest.test('Optional.getOr', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('none', x, Maybes.getOr(nothing, x));
    Assert.eq('none', x, Maybes.getOrThunk(nothing, () => x));
  }));
  fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
    Assert.eq('some', x, Maybes.getOr(just(x), y));
    Assert.eq('some', x, Maybes.getOrThunk(just(x), Fun.die('boom')));
  }));
});
