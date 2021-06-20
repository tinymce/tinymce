import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.EnsureLeadingTest', () => {
  it('ensureLeading', () => {
    const check = (expected: string, str: string, prefix: string) => {
      const actual = Strings.ensureLeading(str, prefix);
      assert.equal(actual, expected);
    };

    check('', '', '');
    check('a', 'a', 'a');
    check('ab', 'ab', 'a');
    check('ab', 'b', 'a');
    check('a', '', 'a');
  });

  it('startsWith a prefix', () => {
    fc.assert(fc.property(fc.string(), fc.string(),
      (prefix, suffix) => Strings.startsWith(prefix + suffix, prefix)
    ));
  });
});
