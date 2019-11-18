import * as Arr from 'ephox/katamari/api/Arr';
import { Option } from 'ephox/katamari/api/Option';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';

const { tNumber } = Testable;

UnitTest.test('Arr.findIndex: unit tests', () => {
  const checkNoneHelper = (input: ArrayLike<number>, pred: (x: number) => boolean): void => {
    Assert.eq('should be none', Option.none(), Arr.findIndex(input, pred), tOption(tNumber));
  };

  const checkNone = (input: number[], pred: (x: number) => boolean): void => {
    checkNoneHelper(input, pred);
    checkNoneHelper(Object.freeze(input.slice()), pred);
  };

  const checkHelper = (expected: number, input: ArrayLike<number>, pred: (x: number) => boolean): void => {
    Assert.eq('should be some', Option.some(expected), Arr.findIndex(input, pred), tOption(tNumber));
  };

  const check = (expected: number, input: number[], pred: (x: number) => boolean): void => {
    checkHelper(expected, input, pred);
    checkHelper(expected, Object.freeze(input), pred);
  };

  checkNone([], (x) => x > 0);
  checkNone([ -1 ], (x) => x > 0);
  check(0, [ 1 ], (x) => x > 0);
  check(3, [ 4, 2, 10, 41, 3 ], (x) => x === 41);
  check(5, [ 4, 2, 10, 41, 3, 100 ], (x) => x > 80);
  checkNone([ 4, 2, 10, 412, 3 ], (x) => x === 41);
});

UnitTest.test('Arr.findIndex: find in middle of array', () => {
  fc.assert(fc.property(fc.array(fc.nat()), arbNegativeInteger(), fc.array(fc.nat()), (prefix, element, suffix) => {
    const arr = prefix.concat([ element ]).concat(suffix);
    Assert.eq(
      'Element should be found immediately after the prefix array',
      Option.some(prefix.length),
      Arr.findIndex(arr, (x) => x === element),
      tOption(tNumber)
    );
  }));
});

UnitTest.test('Arr.findIndex: Element found passes predicate', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    const pred = (x) => x % 3 === 0;
    return Arr.findIndex(arr, pred).forall((x) => pred(arr[x]));
  }));
});

UnitTest.test('Arr.findIndex: If predicate is always false, then index is always none', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    Assert.eq('should be none', Option.none(), Arr.findIndex(arr, () => false), tOption(tNumber));
  }));
});

UnitTest.test('Arr.findIndex: consistent with find', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    const pred = (x) => x % 5 === 0;
    Assert.eq('findIndex vs find', Arr.find(arr, pred), Arr.findIndex(arr, pred).map((x) => arr[x]), tOption(tNumber));
  }));
});

UnitTest.test('Arr.findIndex: consistent with exists', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    const pred = (x) => x % 6 === 0;
    Assert.eq('findIndex vs find', Arr.exists(arr, pred), Arr.findIndex(arr, pred).isSome());
  }));
});
