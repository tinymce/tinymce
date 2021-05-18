import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import { Arr } from 'ephox/katamari/api/Main';
import { assertSome } from 'ephox/katamari/test/AssertOptional';

const arrayLike: ArrayLike<number> = {
  length: 6,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5
};

describe('atomic.katamari.api.arr.ArrArrayLikeTest', () => {
  context('Arr functions using ArrayLike values', () => {
    it('indexOf', () => {
      assertSome(Arr.indexOf(arrayLike, 3), 3);
    });

    it('contains', () => {
      assert.deepEqual(Arr.contains(arrayLike, 3), true);
    });

    it('map', () => {
      assert.deepEqual(Arr.map(arrayLike, ((n) => n + 1)), [ 1, 2, 3, 4, 5, 6 ]);
    });

    it('find', () => {
      assertSome(Arr.find(arrayLike, ((n) => n === 3)), 3);
    });

    it('head', () => {
      assertSome(Arr.head(arrayLike), 0);
    });

    it('last', () => {
      assertSome(Arr.last(arrayLike), 5);
    });
  });
});
