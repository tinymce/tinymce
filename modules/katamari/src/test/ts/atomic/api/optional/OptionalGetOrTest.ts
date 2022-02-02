import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';

describe('atomic.katamari.api.optional.OptionalGetOrTest', () => {
  it('Optional.getOr', () => {
    fc.assert(fc.property(fc.integer(), (x) => {
      assert.equal(Optional.none().getOr(x), x);
      assert.equal(Optional.none().getOrThunk(() => x), x);
    }));
    fc.assert(fc.property(fc.integer(), fc.integer(), (x, y) => {
      assert.equal(Optional.some(x).getOr(y), x);
      assert.equal(Optional.some(x).getOrThunk(Fun.die('boom')), x);
    }));
  });
});
