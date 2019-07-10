import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ArrFromTest', function () {
  const func = function (...x: any[]) {
    assert.eq([1, 2, 3], Arr.from(arguments));
  };
  func(1, 2, 3);

  const obj = {
    0: 'a',
    1: 'b',
    length: 2
  };

  assert.eq(['a', 'b'], Arr.from(obj));
});
