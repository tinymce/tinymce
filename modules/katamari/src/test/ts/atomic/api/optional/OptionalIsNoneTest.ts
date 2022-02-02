import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';

describe('atomic.katamari.api.optional.OptionalIsNoneTest', () => {
  it('Optional.isNone', () => {
    assert.isTrue(Optional.none().isNone());
    fc.assert(fc.property(fc.anything(), (x) => {
      assert.isFalse(Optional.some(x).isNone());
    }));
  });
});
