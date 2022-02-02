import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.EmptyTest', () => {
  it('isEmpty unit test', () => {
    const check = (expected: boolean, str: string) => {
      assert.equal(Strings.isEmpty(str), expected);
    };

    check(false, 'a');
    check(false, ' ');
    check(true, '');
  });

  it('isNonEmpty unit test', () => {
    const check = (expected: boolean, str: string) => {
      assert.equal(Strings.isNotEmpty(str), expected);
    };

    check(true, 'a');
    check(true, ' ');
    check(false, '');
  });

  it('A string with length 1 or larger should never be empty', () => {
    fc.assert(fc.property(fc.string(1, 40), (str) => {
      assert.isFalse(Strings.isEmpty(str));
      assert.isTrue(Strings.isNotEmpty(str));
    }));
  });
});
