import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';

describe('atomic.katamari.api.optional.OptionalGetOrTest', () => {
  it('Optional.getOr', () => {
    fc.assert(fc.property(fc.integer(), (x) => {
      assert.deepEqual(Optional.none().getOr(x), x);
      assert.deepEqual(Optional.none().getOrThunk(() => x), x);
    }));
    fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
      assert.deepEqual(Optional.some(x).getOr(y), x);
      assert.deepEqual(Optional.some(x).getOrThunk(Fun.die('boom')), x);
    }));
  });
});
