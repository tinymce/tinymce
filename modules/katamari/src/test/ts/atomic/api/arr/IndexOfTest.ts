import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrLastTest', () => {

  it('unit tests', () => {
    const checkNoneHelper = <T>(xs: ReadonlyArray<T>, x: any) => {
      assertNone(Arr.indexOf(xs, x));
    };

    const checkNone = <T>(xs: T[], x: any) => {
      checkNoneHelper(xs, x);
      checkNoneHelper(Object.freeze(xs.slice()), x);
    };

    const checkHelper = <T>(expected: number, xs: ReadonlyArray<T>, x: T) => {
      assertSome(Arr.indexOf(xs, x), expected);
    };

    const check = <T>(expected: number, xs: T[], x: T) => {
      checkHelper(expected, xs, x);
      checkHelper(expected, Object.freeze(xs.slice()), x);
    };

    checkNone([], 'x');
    checkNone([ 'q' ], 'x');
    checkNone([ 1 ], '1');
    checkNone([ 1 ], undefined);
    check(0, [ undefined ], undefined);
    check(0, [ undefined, undefined ], undefined);
    check(1, [ 1, undefined ], undefined);
    check(2, [ 'dog', 3, 'cat' ], 'cat');
  });

  it('finds element in middle of array', () => {
    fc.assert(fc.property(fc.array(fc.nat()), arbNegativeInteger(), fc.array(fc.nat()), (prefix, element, suffix) => {
      const arr = prefix.concat([ element ]).concat(suffix);
      assertSome(Arr.indexOf(arr, element), prefix.length);
    }));
  });

  it('indexOf of an empty array is none', () => {
    fc.property(
      fc.integer(),
      (x) => {
        assertNone(Arr.indexOf([], x));
      }
    );
  });

  it('indexOf of a [value].concat(array) is some(0)', () => {
    fc.property(
      fc.array(fc.integer()),
      fc.integer(),
      (arr, x) => {
        assertSome(Arr.indexOf([ x ].concat(arr), x), 0);
      }
    );
  });
});
