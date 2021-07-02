import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.EnsureTrailingTest', () => {
  it('unit tests', () => {
    const check = (expected: string, str: string, suffix: string) => {
      const actual = Strings.ensureTrailing(str, suffix);
      assert.equal(actual, expected);
    };

    check('', '', '');
    check('a', 'a', 'a');
    check('aab', 'a', 'ab');
    check('cat/', 'cat', '/');
    check('cat/', 'cat/', '/');
    check('/', '', '/');
  });

  it('ensureTrailing is identity if string already ends with suffix', () => {
    fc.assert(fc.property(
      fc.string(),
      fc.string(),
      (prefix, suffix) => {
        const s = prefix + suffix;
        assert.equal(Strings.ensureTrailing(s, suffix), s);
      }));
  });

  it('ensureTrailing endsWith', () => {
    fc.assert(fc.property(
      fc.string(),
      fc.string(),
      (s, suffix) => Strings.endsWith(Strings.ensureTrailing(s, suffix), suffix)
    ));
  });
});
