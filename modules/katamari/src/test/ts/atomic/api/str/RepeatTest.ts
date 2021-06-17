import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.RepeatTest', () => {
  it('unit tests', () => {
    assert.equal(Strings.repeat('*', 5), '*****');
    assert.equal(Strings.repeat(' ', 0), '');
    assert.equal(Strings.repeat('-', -1), '');
  });

  it('positive range', () => {
    fc.assert(fc.property(fc.char(), fc.integer(1, 100), (c, count) => {
      const actual = Strings.repeat(c, count);
      assert.equal(actual.length, count);
      assert.equal(actual.charAt(0), c);
      assert.equal(actual.charAt(actual.length - 1), c);
    }));

    fc.assert(fc.property(fc.asciiString(5), fc.integer(1, 100), (s, count) => {
      const actual = Strings.repeat(s, count);
      assert.equal(actual.length, count * s.length);
      assert.equal(actual.indexOf(s), 0);
      assert.equal(actual.lastIndexOf(s), actual.length - s.length);
    }));
  });

  it('negative range', () => {
    fc.assert(fc.property(fc.char(), fc.integer(-100, 0), (c, count) => {
      const actual = Strings.repeat(c, count);
      assert.equal(actual.length, 0);
      assert.equal(actual, '');
    }));
  });
});
