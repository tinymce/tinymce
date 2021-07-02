import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';
import { assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.AssertOptionalTest', () => {
  it('fails for none vs some', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assert.throw(() => {
        assertOptional(Optional.none(), Optional.some(n));
      });
    }));
  });

  it('fails for some vs none', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assert.throw(() => {
        assertOptional(Optional.some(n), Optional.none());
      });
    }));
  });

  it('fails when some values are different', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assert.throw(() => {
        assertOptional(Optional.some(n), Optional.some(n + 1));
      });
    }));
  });

  it('passes for two nones', () => {
    assertOptional(Optional.none(), Optional.none());
  });

  it('passes for identical somes', () => {
    fc.assert(fc.property(fc.nat(), (n) => {
      assertOptional(Optional.some(n), Optional.some(n));
    }));
  });

  it('passes for identical some arrays', () => {
    fc.assert(fc.property(fc.array(fc.nat()), (n) => {
      assertOptional(Optional.some(n), Optional.some(n));
    }));
  });
});
