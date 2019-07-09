import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('removeLeading', function () {
  function check(expected, str, trail) {
    const actual = Strings.removeLeading(str, trail);
    assert.eq(expected, actual);
  }

  check('', '', '');
  check('cat', 'cat', '');
  check('', '', '/');
  check('cat', '/cat', '/');
  check('', 'cat/', 'cat/');

  check('dog', 'catdog', 'cat');

  Jsc.property(
    'startsWith(removeLeading(str, s1), s1) === false (unless it doubled up)',
    Jsc.asciistring,
    Jsc.asciinestring,
    function (str, s1) {
      const doubleStart = Strings.startsWith(str, s1) && Strings.startsWith(str.substring(s1.length), s1);
      return Jsc.eq(
        doubleStart,
        Strings.startsWith(
          Strings.removeLeading(str, s1),
          s1
        )
      );
    }
  );

  Jsc.property(
    'removeLeading(s1 + str, s1) === str',
    Jsc.asciistring,
    Jsc.asciinestring,
    function (str, s1) {
      return Jsc.eq(str, Strings.removeLeading(s1 + str, s1));
    }
  );
});
