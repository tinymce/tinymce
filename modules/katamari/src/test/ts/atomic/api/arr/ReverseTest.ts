import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ReverseTest', function () {
  Jsc.property('Reversing twice is identity', '[nat]', function (a) {
    return Jsc.eq(a, Arr.reverse(Arr.reverse(a)));
  });

  Jsc.property('Reverse lists of 1 element', 'nat', function (a) {
    return Jsc.eq([a], Arr.reverse([a]));
  });

  Jsc.property('Reverse lists of 2 elements', 'nat', 'string', function (a, b) {
    return Jsc.eq([b, a], Arr.reverse([a, b]));
  });

  Jsc.property('Reverse lists of 3 elements', 'bool', 'nat', 'string', function (a, b, c) {
    return Jsc.eq([c, b, a], Arr.reverse([a, b, c]));
  });

  const check = function (expected, input) {
    assert.eq(expected, Arr.reverse(input));
    assert.eq(expected, Arr.reverse(Object.freeze(input.slice())));
  };

  check([], []);
  check([1], [1]);
  check([1, 2], [2, 1]);
  check([2, 1], [1, 2]);
  check([1, 4, 5, 3, 2], [2, 3, 5, 4, 1]);
});
