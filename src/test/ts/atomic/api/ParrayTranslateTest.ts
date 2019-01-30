import PositionArray from 'ephox/polaris/api/PositionArray';
import Parrays from 'ephox/polaris/test/Parrays';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('api.PositionArray.translate', function () {
  const check = function (expected, input, offset) {
    const initial = Parrays.make(input);
    const actual = PositionArray.translate(initial, offset);
    assert.eq(expected, Parrays.dump(actual));
  };

  check([], [], 0);
  check([ '1->4@ cat' ], [ 'cat' ], 1);
  check([ '0->3@ cat', '3->5@ yo', '5->8@ sup' ], [ 'cat', 'yo', 'sup' ], 0);
  check([ '3->6@ cat', '6->8@ yo', '8->11@ sup' ], [ 'cat', 'yo', 'sup' ], 3);
});
