import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.StartsWithTest', () => {
  it('unit tests', () => {
    const check = (expected: boolean, str: string, prefix: string) => {
      const actual = Strings.startsWith(str, prefix);
      assert.equal(actual, expected);
    };

    check(true, '', '');
    check(true, 'a', '');
    check(true, 'a', 'a');
    check(true, 'ab', 'a');
    check(true, 'abc', 'ab');

    check(false, '', 'a');
    check(false, 'caatatetatat', 'cat');
  });

  it('property test', () => {
    fc.assert(fc.property(
      fc.asciiString(),
      fc.asciiString(),
      (str, contents) => Strings.startsWith(contents + str, contents)
    ));
  });
});
