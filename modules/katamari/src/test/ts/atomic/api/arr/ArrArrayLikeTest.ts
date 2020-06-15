import { Assert, UnitTest } from '@ephox/bedrock-client';
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

UnitTest.test('ArrArrayLikeTest', () => {
  Assert.eq('eq', 3, Arr.indexOf(arrayLike, 3).getOrDie('test should have found a 3'));
  Assert.eq('eq', true, Arr.contains(arrayLike, 3));
  Assert.eq('eq', [ 1, 2, 3, 4, 5, 6 ], Arr.map(arrayLike, ((n) => n + 1)));
  Assert.eq('eq', 3, Arr.find(arrayLike, ((n) => n === 3)).getOrDie('test should have found a 3'));
  Assert.eq('eq', 0, Arr.head(arrayLike).getOrDie('array like object should have a head'));
  Assert.eq('eq', 5, Arr.last(arrayLike).getOrDie('array like object should have a last'));
});
