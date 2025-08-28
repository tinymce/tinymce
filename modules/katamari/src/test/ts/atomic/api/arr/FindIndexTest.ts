import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertNone, assertOptional, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.FindIndexTest', () => {
  it('unit tests', () => {
    const checkNoneHelper = (input: ArrayLike<number>, pred: (x: number) => boolean): void => {
      assertNone(Arr.findIndex(input, pred));
    };

    const checkNone = (input: number[], pred: (x: number) => boolean): void => {
      checkNoneHelper(input, pred);
      checkNoneHelper(Object.freeze(input.slice()), pred);
    };

    const checkHelper = (expected: number, input: ArrayLike<number>, pred: (x: number) => boolean): void => {
      assertSome(Arr.findIndex(input, pred), expected);
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

  describe('finds element in middle of array', () => {
    fc.assert(fc.property(fc.array(fc.nat()), arbNegativeInteger(), fc.array(fc.nat()), (prefix, element, suffix) => {
      const arr = [ ...prefix, element, ...suffix ];
      assertSome(
        Arr.findIndex(arr, (x) => x === element),
        prefix.length
      );
    }));
  });

  it('finds elements that pass the predicate', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      const pred = (x: number) => x % 3 === 0;
      assert.isTrue(Arr.findIndex(arr, pred).forall((x) => pred(arr[x])));
    }));
  });

  it('returns none if predicate always returns false', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      assertNone(Arr.findIndex(arr, Fun.never));
    }));
  });

  it('is consistent with find', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      const pred = (x: number) => x % 5 === 0;
      assertOptional(Arr.findIndex(arr, pred).map((x) => arr[x]), Arr.find(arr, pred));
    }));
  });

  it('is consistent with exists', () => {
    fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
      const pred = (x: number) => x % 6 === 0;
      assert.equal(Arr.findIndex(arr, pred).isSome(), Arr.exists(arr, pred));
    }));
  });
});
