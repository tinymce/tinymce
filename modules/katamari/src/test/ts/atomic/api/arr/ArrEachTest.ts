import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';

interface TestResult<T> {
  readonly index: number;
  readonly value: T;
}

describe('atomic.katamari.api.arr.ArrEachTest', () => {
  context('Arr.each', () => {
    it('unit test', () => {
      const checkLHelper = <T>(expected: TestResult<T>[], input: ArrayLike<T>) => {
        const values: Array<TestResult<T>> = [];
        Arr.each(input, (x, i) => {
          values.push({ index: i, value: x });
        });
        assert.deepEqual(values, expected);
      };

      const checkL = <T>(expected: TestResult<T>[], input: T[]) => {
        checkLHelper(expected, input);
        checkLHelper(expected, Object.freeze(input.slice()));
      };

      checkL([], []);
      checkL([{ index: 0, value: 1 }], [ 1 ]);
      checkL([{ index: 0, value: 2 }, { index: 1, value: 3 }, { index: 2, value: 5 }], [ 2, 3, 5 ]);
    });

    it('property test', () => {
      fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const values: number[] = [];
          // noinspection JSVoidFunctionReturnValueUsed
          const output = Arr.each(arr, (x, _i) => {
            values.push(x);
          });
          assert.deepEqual(output, undefined);
          assert.deepEqual(values, arr);
        }
      ));
    });

  });

  context('Arr.eachr', () => {
    it('unit test', () => {
      const checkRHelper = <T>(expected: TestResult<T>[], input: ArrayLike<T>) => {
        const values: Array<TestResult<T>> = [];
        Arr.eachr(input, (x, i) => {
          values.push({ index: i, value: x });
        });
        assert.deepEqual(values, expected);
      };

      const checkR = <T>(expected: TestResult<T>[], input: T[]) => {
        checkRHelper(expected, input);
        checkRHelper(expected, Object.freeze(input.slice()));
      };

      checkR([{ index: 2, value: 2 }, { index: 1, value: 3 }, { index: 0, value: 5 }], [ 5, 3, 2 ]);
    });

    it('property test', () => {
      fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const values: number[] = [];
          // noinspection JSVoidFunctionReturnValueUsed
          const output = Arr.eachr(arr, (x, _i) => {
            values.push(x);
          });
          assert.deepEqual(output, undefined);
          assert.deepEqual(values, Arr.reverse(arr));
        }
      ));
    });
  });
});
