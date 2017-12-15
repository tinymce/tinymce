import Arrays from 'ephox/polaris/api/Arrays';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('api.Arrays.sliceby', function() {
  var check = function (expected, input, pred) {
    var actual = Arrays.sliceby(input, pred);
    assert.eq(expected, actual);
  };

  var is = function (value) {
    return function (x) {
      return x === value;
    };
  };

  check([ ], [ ], is(0));
  check([ ], [ 1 ], is(1));
  check([ 1 ], [ 1, 2 ], is(2));
  check([ 1, 2, 3 ], [1, 2, 3, 4 ], is(4));
});

