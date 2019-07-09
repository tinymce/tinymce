import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, assert } from '@ephox/bedrock';

const arrayLike: ArrayLike<number> = {
  length: 6,
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

UnitTest.test('ArrArrayLikeTest', () => {
  assert.eq(3, Arr.indexOf(arrayLike, 3).getOrDie('test should have found a 3'));
  assert.eq(true, Arr.contains(arrayLike, 3));
  assert.eq([1, 2, 3, 4, 5, 6], Arr.map(arrayLike, ((n) => n + 1)));
  assert.eq(3, Arr.find(arrayLike, ((n) => n === 3)).getOrDie('test should have found a 3'));
  assert.eq(0, Arr.head(arrayLike).getOrDie('array like object should have a head'));
  assert.eq(5, Arr.last(arrayLike).getOrDie('array like object should have a last'));
});
