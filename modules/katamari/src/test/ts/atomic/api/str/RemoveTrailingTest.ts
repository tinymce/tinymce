import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.RemoveTrailingTest', () => {
  it('unit tests', () => {
    const check = (expected: string, str: string, trail: string) => {
      const actual = Strings.removeTrailing(str, trail);
      assert.equal(actual, expected);
    };

    check('', '', '');
    check('cat', 'cat', '');
    check('', '', '/');
    check('cat', 'cat/', '/');
    check('', 'cat/', 'cat/');
  });

  it('removeTrailing property', () => {
    fc.assert(fc.property(
      fc.asciiString(),
      fc.asciiString(),
      (prefix, suffix) => {
        assert.equal(Strings.removeTrailing(prefix + suffix, suffix), prefix);
      }
    ));
  });
});
