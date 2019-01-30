import { Fun } from '@ephox/katamari';
import Arrays from 'ephox/polaris/api/Arrays';
import Splitting from 'ephox/polaris/api/Splitting';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('api.Arrays.splitby', function () {
  const check = function (expected, input, pred) {
    const actual = Arrays.splitby(input, pred);
    assert.eq(expected, actual);
  };

  check([], [], Fun.constant(true));
  check([[1]], [1], Fun.constant(false));
  check([[1, 2, 3]], [1, 2, 3], Fun.constant(false));
  check([[1], [2, 3], [4, 5, 6], [7], [8]], [1, '|', 2, 3, '|', 4, 5, 6, '|', 7, '|', '|', 8], function (x) {
    return x === '|';
  });

  const predicate = function (value) {
    if (value === 'x') {
      return Splitting.excludeWithout(value);
    } else if (value === '.') {
      return Splitting.excludeWith(value);
    } else {
      return Splitting.include(value);
    }
  };

  const checkAdv = function (expected, input) {
    const actual = Arrays.splitbyAdv(input, predicate);
    assert.eq(expected, actual);
  };

  checkAdv([ ], [ ]);
  checkAdv([
    [ '.' ],
    [ '.' ],
    [ 'a', 'b' ],
    [ 'd', 'e', 'f' ],
    [ '.' ],
    [ 'g' ]
  ], [ 'x', 'x', '.', 'x', '.', 'a', 'b', 'x', 'x', 'd', 'e', 'f', '.', 'g' ]);
});
