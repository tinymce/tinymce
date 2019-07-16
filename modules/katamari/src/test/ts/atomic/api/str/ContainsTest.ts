import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('contains', function () {
  function check(expected, str, substr) {
    const actual = Strings.contains(str, substr);
    assert.eq(expected, actual);
  }

  check(false, 'a', 'b');
  check(false, 'cat', 'dog');
  check(false, 'abc', 'x');
  check(false, '', 'x');
  check(true, '', '');
  check(true, 'cat', '');
  check(true, 'a', 'a');
  check(true, 'ab', 'ab');
  check(true, 'ab', 'a');
  check(true, 'ab', 'b');
  check(true, 'abc', 'b');

  Jsc.property(
    'A string added to a string (at the end) must be contained within it',
    Jsc.string,
    Jsc.nestring,
    function (str, contents) {
      const r = str + contents;
      return Jsc.eq(true, Strings.contains(r, contents));
    }
  );

  Jsc.property(
    'A string added to a string (at the start) must be contained within it',
    Jsc.string,
    Jsc.nestring,
    function (str, contents) {
      const r = contents = str;
      return Jsc.eq(true, Strings.contains(r, contents));
    }
  );

  Jsc.property(
    'An empty string should contain nothing',
    Jsc.nestring,
    function (value) {
      return !Strings.contains('', value);
    }
  );
});
