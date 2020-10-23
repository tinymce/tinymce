import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';

UnitTest.test('Optional.getOr', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('none', x, Optional.none().getOr(x));
    Assert.eq('none', x, Optional.none().getOrThunk(() => x));
  }));
  fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
    Assert.eq('some', x, Optional.some(x).getOr(y));
    Assert.eq('some', x, Optional.some(x).getOrThunk(Fun.die('boom')));
  }));
});
