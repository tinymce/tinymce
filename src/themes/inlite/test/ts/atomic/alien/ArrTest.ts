import Arr from 'tinymce/themes/inlite/alien/Arr';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('atomic.themes.alien.ArrTest', function () {
  const testFlatten = function () {
    assert.eq(Arr.flatten([1, 2, [3, 4, [5, 6]], [7, 8], 9]), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  };

  testFlatten();
});
