import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import * as fc from 'fast-check';

interface Z<T> {
  index: number;
  value: T;
}

UnitTest.test('Arr.each: unit test', () => {
  const checkLHelper = <T>(expected: Z<T>[], input: ArrayLike<T>) => {
    const values: Array<Z<T>> = [];
    Arr.each(input, (x, i) => {
      values.push({ index: i, value: x });
    });
    Assert.eq('checkL', expected, values);
  };

  const checkL = (expected, input: any[]) => {
    checkLHelper(expected, input);
    checkLHelper(expected, Object.freeze(input.slice()));
  };

  checkL([], []);
  checkL([{ index: 0, value: 1 }], [1]);
  checkL([{ index: 0, value: 2 }, { index: 1, value: 3 }, { index: 2, value: 5 }], [2, 3, 5]);
});

UnitTest.test('Arr.eachr: unit test', () => {
  const checkRHelper = <T>(expected: Z<T>[], input: ArrayLike<T>) => {
    const values: Array<Z<T>> = [];
    Arr.eachr(input, (x, i) => {
      values.push({ index: i, value: x });
    });
    Assert.eq('checkL', expected, values);
  };

  const checkR = (expected, input: any[]) => {
    checkRHelper(expected, input);
    checkRHelper(expected, Object.freeze(input.slice()));
  };

  checkR([{ index: 2, value: 2 }, { index: 1, value: 3 }, { index: 0, value: 5 }], [5, 3, 2]);
});

UnitTest.test('Arr.each: property test', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const values: number[] = [];
      const output = Arr.each(arr, (x, i) => {
        values.push(x);
      });
      Assert.eq('Return undefined', undefined, output);
      Assert.eq('Captures all input in right order', arr, values);
    }
  ));
});

UnitTest.test('Arr.eachr: property test', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const values: number[] = [];
      const output = Arr.eachr(arr, (x, i) => {
        values.push(x);
      });
      Assert.eq('Return undefined', undefined, output);
      Assert.eq('Captures all input in reverse order', Arr.reverse(arr), values);
    }
  ));
});
