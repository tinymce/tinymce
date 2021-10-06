import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.ToFloatTest', () => {
  it('convert valid string to float', () => {
    const check = (value: string, expected: number) => {
      const num = Strings.toFloat(value).getOrDie();
      assert.equal(num, expected);
    };

    check('123', 123);
    check('456.123', 456.123);
    check('0.0314E+2', 3.14);

    fc.assert(fc.property(fc.float(), (num) => {
      check('' + num, num);
    }));
  });

  it('convert invalid string to float', () => {
    const checkNone = (value: string) => {
      const numOpt = Strings.toFloat(value);
      assert.isFalse(numOpt.isSome());
    };

    checkNone('abc');

    fc.assert(fc.property(fc.string(), (str) => {
      checkNone('a' + str);
    }));
  });
});
