import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.EndsWithTest', () => {
  it('Unit tests', () => {
    const check = (expected: boolean, str: string, suffix: string) => {
      const actual = Strings.endsWith(str, suffix);
      assert.equal(actual, expected);
    };

    check(true, '', '');
    check(true, 'a', '');
    check(true, 'a', 'a');
    check(true, 'ab', 'b');
    check(true, 'abc', 'bc');

    check(false, '', 'a');
    check(false, 'caatatetatat', 'cat');
  });

  it('A string added to a string (at the end) must have endsWith as true', () => {
    fc.assert(fc.property(
      fc.asciiString(),
      fc.asciiString(),
      (str, contents) => Strings.endsWith(str + contents, contents)
    ));
  });
});
