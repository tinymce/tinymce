import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Id from 'ephox/katamari/api/Id';

describe('atomic.katamari.api.data.IdTest', () => () => {
  it('Unit Tests', () => {
    const one = Id.generate('test');
    const two = Id.generate('test');
    assert.equal(one.indexOf('test'), 0);
    assert.equal(two.indexOf('test'), 0);
    assert.notEqual(one, two);
  });

  it('should not generate identical IDs', () => {
    const arbId = fc.string(1, 30).map(Id.generate);
    fc.assert(fc.property(arbId, arbId, (id1, id2) => id1 !== id2));
  });
});
