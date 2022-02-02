import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Maybes from 'ephox/katamari/api/Maybes';

describe('atomic.katamari.maybe.InteropTest', () => {
  context('from', () => {
    it('returns "Nothing" for null and undefined', () => {
      assert.isTrue(Maybes.isNothing(Maybes.from(null)));
      assert.isTrue(Maybes.isNothing(Maybes.from(undefined)));
    });

    it('returns "Just" for other falsey values', () => {
      assert.isTrue(Maybes.isJust(Maybes.from(false)));
      assert.isTrue(Maybes.isJust(Maybes.from(0)));
      assert.isTrue(Maybes.isJust(Maybes.from(-0)));
      assert.isTrue(Maybes.isJust(Maybes.from(0.0)));
      assert.isTrue(Maybes.isJust(Maybes.from('')));
      assert.isTrue(Maybes.isJust(Maybes.from(NaN)));
    });

    it('returns the correct "Just" for normal values', () => {
      const str = Maybes.from('str');
      if (Maybes.isJust(str)) {
        assert.equal(str.value, 'str');
      } else {
        assert.fail('should not be Nothing');
      }

      const number = Maybes.from(42);
      if (Maybes.isJust(number)) {
        assert.equal(number.value, 42);
      } else {
        assert.fail('should not be Nothing');
      }
    });
  });
});