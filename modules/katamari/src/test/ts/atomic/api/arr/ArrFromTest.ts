import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Arr from 'ephox/katamari/api/Arr';

describe('atomic.katamari.api.arr.ArrFromTest', () => {
  it('works with arguments values', () => {

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/no-unused-vars
    const func = function (...args: number[]) {
      assert.deepEqual(Arr.from(arguments), [ 1, 2, 3 ]);
    };
    func(1, 2, 3);
  });

  it('works with ...args values', () => {

    const func = (...args: number[]) => {
      assert.deepEqual(Arr.from(args), [ 1, 2, 3 ]);
    };
    func(1, 2, 3);
  });

  it('works with an array-like object', () => {
    const obj = {
      0: 'a',
      1: 'b',
      length: 2
    };

    assert.deepEqual(Arr.from(obj), [ 'a', 'b' ]);
  });
});
