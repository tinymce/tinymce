import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrFindTest', () => {
  it('unit tests', () => {
    const checkNoneHelper = (input: ArrayLike<number>, pred: (n: number, i: number) => boolean): void => {
      assertNone(Arr.find(input, pred));
    };

    const checkNone = (input: ArrayLike<number>, pred: (n: number, i: number) => boolean) => {
      checkNoneHelper(input, pred);
      checkNoneHelper(Object.freeze(input), pred);
    };

    const checkArrHelper = (expected: number, input: ArrayLike<number>, pred: (n: number, i: number) => boolean): void => {
      const actual = Arr.find(input, pred);
      assertSome(actual, expected);
    };

    const checkArr = (expected: number, input: ArrayLike<number>, pred: (n: number, i: number) => boolean): void => {
      checkArrHelper(expected, input, pred);
      checkArrHelper(expected, Object.freeze(input), pred);
    };

    const checkArrGuard = <T, U extends T>(expected: U, input: ArrayLike<T>, pred: (n: T, i: number) => n is U): void => {
      const actual: Optional<U> = Arr.find(input, pred);
      assertSome(actual, expected);
    };

    checkNone([], (x) => x > 0);
    checkNone([], (_x) => {
      throw new Error('should not be called');
    });
    checkNone([ -1 ], (x) => x > 0);
    checkArr(1, [ 1 ], (x) => x > 0);
    checkArr(41, [ 4, 2, 10, 41, 3 ], (x) => x === 41);
    checkArr(100, [ 4, 2, 10, 41, 3, 100 ], (x) => x > 80);
    checkNone([ 4, 2, 10, 412, 3 ], (x) => x === 41);

    checkArr(10, [ 4, 2, 10, 412, 3 ], (x, i) => i === 2);

    checkArrGuard('foo', [ 'foo', 'bar' ], (s): s is 'foo' => s === 'foo');
  });

  it('finds a value in the array', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.array(fc.integer()), (prefix, i, suffix) => {
      const arr = prefix.concat([ i ]).concat(suffix);
      const pred = (x: number) => x === i;
      const result = Arr.find(arr, pred);
      assertSome(result, i);
    }));
  });

  it('cannot find a nonexistent value', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      const result = Arr.find(arr, Fun.never);
      assertNone(result);
    }));
  });
});
