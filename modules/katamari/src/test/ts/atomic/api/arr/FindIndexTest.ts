import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';

const { tNumber } = Testable;

UnitTest.test('Arr.findIndex: unit tests', () => {
  const checkNoneHelper = (input: ArrayLike<number>, pred: (x: number) => boolean): void => {
    Assert.eq('should be none', Optional.none(), Arr.findIndex(input, pred), tOptional(tNumber));
  };

  const checkNone = (input: number[], pred: (x: number) => boolean): void => {
    checkNoneHelper(input, pred);
    checkNoneHelper(Object.freeze(input.slice()), pred);
  };

  const checkHelper = (expected: number, input: ArrayLike<number>, pred: (x: number) => boolean): void => {
    Assert.eq('should be some', Optional.some(expected), Arr.findIndex(input, pred), tOptional(tNumber));
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
      Optional.some(prefix.length),
      Arr.findIndex(arr, (x) => x === element),
      tOptional(tNumber)
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
    Assert.eq('should be none', Optional.none(), Arr.findIndex(arr, Fun.never), tOptional(tNumber));
  }));
});

UnitTest.test('Arr.findIndex: consistent with find', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    const pred = (x) => x % 5 === 0;
    Assert.eq('findIndex vs find', Arr.find(arr, pred), Arr.findIndex(arr, pred).map((x) => arr[x]), tOptional(tNumber));
  }));
});

UnitTest.test('Arr.findIndex: consistent with exists', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    const pred = (x) => x % 6 === 0;
    Assert.eq('findIndex vs find', Arr.exists(arr, pred), Arr.findIndex(arr, pred).isSome());
  }));
});
