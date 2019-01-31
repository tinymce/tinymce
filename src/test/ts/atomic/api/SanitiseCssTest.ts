import Sanitise from 'ephox/polaris/string/Sanitise';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('api.Sanitise.css', function () {
  const check = function (expected, input) {
    const actual = Sanitise.css(input);
    assert.eq(expected, actual);
  };

  check('e', '');
  check('a', 'a');
  check('abcdefg', 'abcdefg');
  check('e_bogus', '_bogus');
  check('a-big-long-string', 'a big long string');
});
