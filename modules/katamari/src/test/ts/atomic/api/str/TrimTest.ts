import * as Strings from 'ephox/katamari/api/Strings';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('trim', function () {
  function check(expectedL, expectedR, expected, input) {
    assert.eq(expected, Strings.trim(input));
    assert.eq(expectedL, Strings.lTrim(input));
    assert.eq(expectedR, Strings.rTrim(input));
  }

  check('', '', '', '');
  check('', '', '', ' ');
  check('', '', '', '  ');
  check('a', 'a', 'a', 'a');
  check('a ', 'a', 'a', 'a ');
  check('a', ' a', 'a', ' a');
  check('a ', ' a', 'a', ' a ');
  check('a      ', '    a', 'a', '    a      ');
  check('a    b  cd  ', '    a    b  cd', 'a    b  cd', '    a    b  cd  ');

  Jsc.property(
    'leftTrim(whitespace + s) === leftTrim(s)',
    Jsc.string,
    function (s) {
      return Jsc.eq(true, Strings.lTrim(' ' + s) === Strings.lTrim(s));
    }
  );

  Jsc.property(
    'leftTrim(s + whitespace) !== leftTrim(s) unless leftTrim(s) is empty',
    Jsc.string,
    function (s) {
      return Jsc.eq(false, Strings.lTrim(s + ' ') === Strings.lTrim(s)) || Strings.lTrim(s).length === 0;
    }
  );

  Jsc.property(
    'rightTrim(s + whitespace) === rightTrim(s)',
    Jsc.string,
    function (s) {
      return Jsc.eq(true, Strings.rTrim(s + ' ') === Strings.rTrim(s));
    }
  );

  Jsc.property(
    'rightTrim(whitespace + s) !== rightTrim(s) unless rightTrim(s) is empty',
    Jsc.string,
    function (s) {
      return Jsc.eq(false, Strings.rTrim(' ' + s) === Strings.rTrim(s)) || Strings.rTrim(s).length === 0;
    }
  );

  Jsc.property(
    'trim(whitespace + s) === trim(s)',
    Jsc.string,
    function (s) {
      return Jsc.eq(true, Strings.trim(' ' + s) === Strings.trim(s));
    }
  );

  Jsc.property(
    'trim(s + whitespace) === trim(s)',
    Jsc.string,
    function (s) {
      return Jsc.eq(true, Strings.trim(s + ' ') === Strings.trim(s));
    }
  );

  Jsc.property(
    'trim(whitespace + s + whitespace) === trim(s)',
    Jsc.string,
    function (s) {
      return Jsc.eq(true, Strings.trim(' ' + s + ' ') === Strings.trim(s));
    }
  );
});
