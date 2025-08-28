import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.RemoveLeadingTest', () => {
  it('unit tests', () => {
    const check = (expected: string, str: string, trail: string) => {
      const actual = Strings.removeLeading(str, trail);
      assert.equal(actual, expected);
    };

    check('', '', '');
    check('cat', 'cat', '');
    check('', '', '/');
    check('cat', '/cat', '/');
    check('', 'cat/', 'cat/');
    check('dog', 'catdog', 'cat');
  });

  it('removeLeading removes prefix', () => {
    fc.assert(fc.property(
      fc.asciiString(),
      fc.asciiString(),
      (prefix, suffix) => {
        assert.equal(Strings.removeLeading(prefix + suffix, prefix), suffix);
      }
    ));
  });
});
