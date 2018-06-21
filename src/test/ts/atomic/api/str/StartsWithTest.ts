import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('startsWith', function() {
  function check(expected, str, prefix) {
      const actual = Strings.startsWith(str, prefix);
      assert.eq(expected, actual);
  }

  check(true, '', '');
  check(true, 'a', '');
  check(true, 'a', 'a');
  check(true, 'ab', 'a');
  check(true, 'abc', 'ab');

  check(false, '', 'a');
  check(false, 'caatatetatat', 'cat');

  Jsc.property(
    'A string added to a string (at the start) must have startsWith as true',
    Jsc.string,
    Jsc.nestring,
    function (str, contents) {
      const r = contents + str;
      return Jsc.eq(true, Strings.startsWith(r, contents));
    }
  );
});

