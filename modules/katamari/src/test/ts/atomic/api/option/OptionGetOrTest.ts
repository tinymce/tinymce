import { Option } from 'ephox/katamari/api/Option';
import * as Fun from 'ephox/katamari/api/Fun';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Option.getOr', () => {
  fc.assert(fc.property(fc.integer(), (x) => {
    Assert.eq('none', x, Option.none().getOr(x));
    Assert.eq('none', x, Option.none().getOrThunk(() => x));
  }));
  fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
    Assert.eq('some', x, Option.some(x).getOr(y));
    Assert.eq('some', x, Option.some(x).getOrThunk(Fun.die('boom')));
  }));
});
