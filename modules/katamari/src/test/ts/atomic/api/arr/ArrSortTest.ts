import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ArrSortTest', function () {
  const testSanity = function () {
    assert.eq([1, 2, 3], Arr.sort([1, 3, 2]));
    assert.eq([1, 2, 3], Arr.sort(Object.freeze([1, 3, 2])));
  };

  testSanity();

  Jsc.property(
    'sort(sort(xs)) === sort(xs)', Jsc.array(Jsc.nat), function (arr) {
      const sorted = Arr.sort(arr);
      const resorted = Arr.sort(sorted);
      return Jsc.eq(sorted, resorted);
    }
  );
});
