import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Jam from 'ephox/katamari/api/Jam';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';

describe('atomic.katamari.api.arr.IntersperseTest', () => {
  it('unit tests', () => {
    const check = <T>(expected: T[], input: T[], delimiter: T) => {
      const actual = Jam.intersperse(input, delimiter);
      assert.deepEqual(actual, expected);
    };

    const checkErr = (expected: string, input: any, delimiter: number) => {
      try {
        Jam.intersperse(input, delimiter);
        assert.fail('Expected exception: ' + expected + ' from input: ' + input + ' with delimiter: ' + delimiter);
      } catch (e: any) {
        assert.deepEqual(e.message, expected);
      }
    };

    check([], [], 2);
    check([ 1 ], [ 1 ], 2);
    check([ 1, 2, 1, 2, 1 ], [ 1, 1, 1 ], 2);
    check([ 'a', 3, 'a', 3, 'a' ], [ 'a', 'a', 'a' ], 3);
    check([[ 1 ], [ 4 ], [ 1 ]], [[ 1 ], [ 1 ]], [ 4 ]);
    checkErr('Cannot intersperse undefined', undefined, 2);
  });

  it('Length of interspersed = len(arr) + len(arr)-1', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.integer(),
      (arr, delimiter) => {
        const actual = Jam.intersperse(arr, delimiter);
        const expected = arr.length === 0 ? 0 : arr.length * 2 - 1;
        assert.deepEqual(actual.length, expected);
      }
    ));
  });

  it('Every odd element matches delimiter', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.integer(),
      (arr, delimiter) => {
        const actual = Jam.intersperse(arr, delimiter);
        return Arr.forall(actual, (x, i) => i % 2 === 1 ? x === delimiter : true);
      }
    ));
  });

  it('Filtering out delimiters (assuming different type to array to avoid removing original array) should equal original', () => {
    fc.assert(fc.property(
      fc.array(fc.nat()),
      arbNegativeInteger(),
      (arr, delimiter) => {
        const actual = Jam.intersperse(arr, delimiter);
        const filtered = Arr.filter(actual, (a) => a !== delimiter);
        assert.deepEqual(filtered, arr);
      }
    ));
  });
});
