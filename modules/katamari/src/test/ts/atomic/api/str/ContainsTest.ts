import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.ContainsTest', () => {
  it('unit test', () => {
    const check = (expected: boolean, str: string, substr: string) => {
      const actual = Strings.contains(str, substr);
      assert.equal(actual, expected);
    };

    check(false, 'a', 'b');
    check(false, 'cat', 'dog');
    check(false, 'abc', 'x');
    check(false, '', 'x');
    check(true, '', '');
    check(true, 'cat', '');
    check(true, 'a', 'a');
    check(true, 'ab', 'ab');
    check(true, 'ab', 'a');
    check(true, 'ab', 'b');
    check(true, 'abc', 'b');
  });

  it('A string added to a string (at the end) must be contained within it', () => {
    fc.assert(fc.property(
      fc.string(),
      fc.string(1, 40),
      (str, contents) => {
        const r = str + contents;
        assert.isTrue(Strings.contains(r, contents));
      }
    ));
  });

  it('A string added to a string (at the start) must be contained within it', () => {
    fc.assert(fc.property(
      fc.string(),
      fc.string(1, 40),
      (str, contents) => {
        const r = contents = str;
        assert.isTrue(Strings.contains(r, contents));
      }
    ));
  });

  it('An empty string should contain nothing', () => {
    fc.assert(fc.property(
      fc.string(1, 40),
      (value) => !Strings.contains('', value)
    ));
  });
});
