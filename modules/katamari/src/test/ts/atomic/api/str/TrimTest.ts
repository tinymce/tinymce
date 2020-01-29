import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tString } = Testable;

UnitTest.test('Strings.trim: unit tests', () => {
  function check(expectedL, expectedR, expected, input) {
    Assert.eq('trim', expected, Strings.trim(input), tString);
    Assert.eq('lTrim', expectedL, Strings.lTrim(input), tString);
    Assert.eq('rTrim', expectedR, Strings.rTrim(input), tString);
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
});

UnitTest.test('leftTrim(whitespace + s) === leftTrim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('leftTrim', Strings.lTrim(' ' + s), Strings.lTrim(s), tString);
    }
  ));
});

UnitTest.test('rightTrim(s + whitespace) === rightTrim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('rightTrim', Strings.rTrim(s + ' '), Strings.rTrim(s), tString);
    }
  ));
});

UnitTest.test('trim(whitespace + s) === trim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('trim', Strings.trim(' ' + s), Strings.trim(s), tString);
    }
  ));
});

UnitTest.test('trim(s + whitespace) === trim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('trim', Strings.trim(s + ' '), Strings.trim(s), tString);
    }
  ));
});

UnitTest.test('trim(whitespace + s + whitespace) === trim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('trim', Strings.trim(' ' + s + ' '), Strings.trim(s), tString);
    }
  ));
});
