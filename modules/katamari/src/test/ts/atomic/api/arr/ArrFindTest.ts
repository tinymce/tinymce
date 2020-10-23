import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

const { tNumber } = Testable;

UnitTest.test('Arr.find: Unit tests', () => {
  const checkNoneHelper = (input: ArrayLike<number>, pred: (n: number, i: number) => boolean): void => {
    Assert.eq('none', Optional.none(), Arr.find(input, pred), tOptional(tNumber));
  };

  const checkNone = (input: ArrayLike<number>, pred: (n: number, i: number) => boolean) => {
    checkNoneHelper(input, pred);
    checkNoneHelper(Object.freeze(input), pred);
  };

  const checkArrHelper = (expected: number, input: ArrayLike<number>, pred: (n: number, i: number) => boolean): void => {
    const actual = Arr.find(input, pred);
    Assert.eq('some', Optional.some(expected), actual, tOptional(tNumber));
  };

  const checkArr = (expected: number, input: ArrayLike<number>, pred: (n: number, i: number) => boolean): void => {
    checkArrHelper(expected, input, pred);
    checkArrHelper(expected, Object.freeze(input), pred);
  };

  checkNone([], (x) => x > 0);
  checkNone([], (_x) => { throw new Error('should not be called'); });
  checkNone([ -1 ], (x) => x > 0);
  checkArr(1, [ 1 ], (x) => x > 0);
  checkArr(41, [ 4, 2, 10, 41, 3 ], (x) => x === 41);
  checkArr(100, [ 4, 2, 10, 41, 3, 100 ], (x) => x > 80);
  checkNone([ 4, 2, 10, 412, 3 ], (x) => x === 41);

  checkArr(10, [ 4, 2, 10, 412, 3 ], (x, i) => i === 2);
});

UnitTest.test('Arr.find: finds a value in the array', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.array(fc.integer()), (prefix, i, suffix) => {
    const arr = prefix.concat([ i ]).concat(suffix);
    const pred = (x) => x === i;
    const result = Arr.find(arr, pred);
    Assert.eq('Element found in array', Optional.some(i), result, tOptional(tNumber));
  }));
});

UnitTest.test('Arr.find: value not found', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    const result = Arr.find(arr, () => false);
    Assert.eq('Element not found in array', Optional.none(), result, tOptional(tNumber));
  }));
});
