import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.ToIntTest', () => {
  it('convert valid string to integer', () => {
    const check = (value: string, expected: number) => {
      const num = Strings.toInt(value).getOrDie();
      assert.equal(num, expected);
    };

    check('123', 123);
    check('456.123', 456);
    check('0.0314E+2', 0);

    fc.assert(fc.property(fc.integer(), (num) => {
      check('' + num, num);
    }));
  });

  it('convert invalid string to integer', () => {
    const checkNone = (value: string) => {
      const numOpt = Strings.toInt(value);
      assert.isFalse(numOpt.isSome());
    };

    checkNone('abc');

    fc.assert(fc.property(fc.string(), (str) => {
      checkNone('a' + str);
    }));
  });
});
