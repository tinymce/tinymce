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

  it('should handle the start and the end parameters', () => {
    const check = (expected: boolean, str: string, substr: string, start: number, end?: number) => {
      const actual = Strings.contains(str, substr, start, end);
      assert.equal(actual, expected);
    };

    check(true, 'abc', 'b', 0);
    check(true, 'abc', 'b', 1);
    check(false, 'abc', 'b', 2);
    check(false, 'abc', 'b', 0, 0);
    check(true, 'abc', 'b', 0, 2);
    check(true, 'abc', 'b', 1, 3);
    check(false, 'abc', 'b', 2, 3);
    check(false, 'abc', 'b', 0, 1);
    check(false, 'abc', 'bc', 1, 2);
  });
});
