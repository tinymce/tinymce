import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('removeTrailing', function() {
  function check(expected, str, trail) {
      const actual = Strings.removeTrailing(str, trail);
      assert.eq(expected, actual);
  }

  check('', '', '');
  check('cat', 'cat', '');
  check('', '', '/');
  check('cat', 'cat/', '/');
  check('', 'cat/', 'cat/');

  Jsc.property(
    'endsWith(removeTrailing(str, s1), s1) === false (unless it doubled up)',
    Jsc.asciistring,
    Jsc.asciinestring,
    function (str, s1) {
      // const doubleStart = Strings.startsWith(str, s1) && Strings.startsWith(str.substring(s1.length), s1);
      const doubleEnd = Strings.endsWith(str, s1) && Strings.endsWith(str.substring(0, str.length - s1.length), s1);
      return Jsc.eq(
        doubleEnd,
        Strings.endsWith(
          Strings.removeTrailing(str, s1),
          s1
        )
      );
    }
  );

  Jsc.property(
    'removeTrailing(str + s1, s1) === str',
    Jsc.asciistring,
    Jsc.asciinestring,
    function (str, s1) {
      return Jsc.eq(str, Strings.removeTrailing(str + s1, s1));
    }
  );
});

