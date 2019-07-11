import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('endsWith', function () {
  function check(expected, str, suffix) {
    const actual = Strings.endsWith(str, suffix);
    assert.eq(expected, actual);
  }

  check(true, '', '');
  check(true, 'a', '');
  check(true, 'a', 'a');
  check(true, 'ab', 'b');
  check(true, 'abc', 'bc');

  check(false, '', 'a');
  check(false, 'caatatetatat', 'cat');

  Jsc.property(
    'A string added to a string (at the end) must have endsWith as true',
    Jsc.string,
    Jsc.nestring,
    function (str, contents) {
      const r = str + contents;
      return Jsc.eq(true, Strings.endsWith(r, contents));
    }
  );
});
