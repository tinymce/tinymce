import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Arr from 'ephox/katamari/api/Arr';

UnitTest.test('ArrFromTest', () => {
  const func = function (..._x: any[]) {
    Assert.eq('eq', [ 1, 2, 3 ], Arr.from(arguments));
  };
  func(1, 2, 3);

  const obj = {
    0: 'a',
    1: 'b',
    length: 2
  };

  Assert.eq('eq', [ 'a', 'b' ], Arr.from(obj));
});
