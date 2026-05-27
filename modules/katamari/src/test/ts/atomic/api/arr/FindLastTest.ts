import { describe, it } from '@ephox/bedrock-client';

import * as Arr from 'ephox/katamari/api/Arr';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.FindLastTest', () => {
  it('TINY-14425: unit tests', () => {
    const checkNoneHelper = (input: ArrayLike<number>, pred: (x: number) => boolean): void => {
      assertNone(Arr.findLast(input, pred));
    };

    const checkNone = (input: number[], pred: (x: number) => boolean): void => {
      checkNoneHelper(input, pred);
      checkNoneHelper(Object.freeze(input.slice()), pred);
    };

    const checkHelper = (expected: number, input: ArrayLike<number>, pred: (x: number) => boolean): void => {
      assertSome(Arr.findLast(input, pred), expected);
    };

    const check = (expected: number, input: number[], pred: (x: number) => boolean): void => {
      checkHelper(expected, input, pred);
      checkHelper(expected, Object.freeze(input), pred);
    };

    checkNone([], (x) => x > 0);
    checkNone([ -1 ], (x) => x > 0);
    check(1, [ 1 ], (x) => x > 0);
    check(3, [ 4, 2, 10, 41, 3 ], (x) => x > 2);
    check(100, [ 4, 2, 10, 41, 3, 100 ], (x) => x > 80);
    checkNone([ 4, 2, 10, 412, 3 ], (x) => x === 41);
  });
});
