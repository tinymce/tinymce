import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ensureTrailing', function() {
  function check(expected, str, suffix) {
    const actual = Strings.ensureTrailing(str, suffix);
    assert.eq(expected, actual);
  }

  check('', '', '');
  check('a', 'a', 'a');
  check('aab', 'a', 'ab');
  check('cat/', 'cat', '/');
  check('cat/', 'cat/', '/');
  check('/', '', '/');

  Jsc.property(
    'endsWith(ensureTrailing(str, s1), s1) === true',
    Jsc.string,
    Jsc.nestring,
    function (str, s1) {
      return Jsc.eq(
        true,
        Strings.endsWith(
          Strings.ensureTrailing(str, s1),
          s1
        )
      );
    }
  );
});

