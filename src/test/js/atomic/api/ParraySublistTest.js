import PositionArray from 'ephox/polaris/api/PositionArray';
import Parrays from 'ephox/polaris/test/Parrays';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('api.PositionArray.sublist', function() {
  var check = function (expected, input, start, finish) {
    var parray = Parrays.make(input);
    var actual = PositionArray.sublist(parray, start, finish);
    assert.eq(expected, Parrays.dump(actual));
  };

  check([], [], 0, 0);
  check([], [ 'this', 'is', 'it' ], 2, 5);
  check([
    '0->4@ this',
    '4->6@ is',
    '6->8@ it'
  ], [ 'this', 'is', 'it' ], 0, 8);

  check([], [ 'this', 'is', 'it' ], 1, 8);
  check([
    '0->4@ this',
    '4->6@ is'
  ], [ 'this', 'is', 'it' ], 0, 6);

  check([
    '4->6@ is'
  ], [ 'this', 'is', 'it' ], 4, 6);

  check([
    '4->6@ is',
    '6->8@ it'
  ], [ 'this', 'is', 'it' ], 4, 8);

  check([], [ 'this', 'is', 'it' ], 4, 9);
});

