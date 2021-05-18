import { context, describe } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as Arr from 'ephox/katamari/api/Arr';

const arrayLike: ArrayLike<number> = {
  length: 6,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5
};

describe('ArrArrayLikeTest', () => {
  context('indexOf', () => {
    assert.deepEqual(Arr.indexOf(arrayLike, 3).getOrDie('test should have found a 3'), 3);
  });

  context('contains', () => {
    assert.deepEqual(Arr.contains(arrayLike, 3), true);
  });

  context('map', () => {
    assert.deepEqual(Arr.map(arrayLike, ((n) => n + 1)), [ 1, 2, 3, 4, 5, 6 ]);
  });

  context('find', () => {
    assert.deepEqual(Arr.find(arrayLike, ((n) => n === 3)).getOrDie('test should have found a 3'), 3);
  });

  context('head', () => {
    assert.deepEqual(Arr.head(arrayLike).getOrDie('array like object should have a head'), 0);
  });

  context('last', () => {
    assert.deepEqual(Arr.last(arrayLike).getOrDie('array like object should have a last'), 5);
  });
});
