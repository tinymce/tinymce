import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrLastTest', () => {
  it('returns none when empty', () => {
    assertNone(Arr.last<number>([]));
  });

  it('returns last element when non-empty', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (init, last) => {
      const arr = init.concat([ last ]);
      assertSome(Arr.last(arr), last);
    }));
  });
});
