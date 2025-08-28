import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';

describe('atomic.katamari.api.arr.ArrBindTest', () => {
  it('unit tests', () => {
    const len = (x: unknown[]): number[] => [ x.length ];

    const check = <T, U>(expected: U[], input: T[][], f: (x: T[]) => U[]) => {
      assert.deepEqual(Arr.bind(input, f), expected);
      assert.deepEqual(Arr.bind(Object.freeze(input.slice()), f), expected);
    };

    check([], [], len);
    check([ 1 ], [[ 1 ]], len);
    check([ 1, 1 ], [[ 1 ], [ 2 ]], len);
    check([ 2, 0, 1, 2, 0 ], [[ 1, 2 ], [], [ 3 ], [ 4, 5 ], []], len);
  });

  it('binding an array of empty arrays with identity equals an empty array', () => {
    fc.assert(fc.property(fc.array(fc.constant<number[]>([])), (arr) => {
      assert.deepEqual(Arr.bind(arr, Fun.identity), []);
    }));
  });

  it('bind (pure .) is map', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, j) => {
      const f = (x: number) => x + j;
      assert.deepEqual(Arr.bind(arr, Fun.compose(Arr.pure, f)), Arr.map(arr, f));
    }));
  });

  context('monad laws', () => {
    it('obeys left identity law', () => {
      fc.assert(fc.property(fc.integer(), fc.integer(), (i, j) => {
        const f = (x: number) => [ x, j, x + j ];
        assert.deepEqual(Arr.bind(Arr.pure(i), f), f(i));
      }));
    });

    it('obeys right identity law', () => {
      fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
        assert.deepEqual(Arr.bind(arr, Arr.pure), arr);
      }));
    });

    it('is associative', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, j) => {
        const f = (x: number) => [ x, j, x + j ];
        const g = (x: number) => [ j, x, x + j ];
        assert.deepEqual(Arr.bind(Arr.bind(arr, f), g), Arr.bind(arr, (x) => Arr.bind(f(x), g)));
      }));
    });
  });
});
