import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Testable as T } from '@ephox/dispute';

UnitTest.test('Strings.trim: unit tests', () => {
  function check(expectedL, expectedR, expected, input) {
    Assert.eq('trim', expected, Strings.trim(input), T.tString);
    Assert.eq('lTrim', expectedL, Strings.lTrim(input), T.tString);
    Assert.eq('rTrim', expectedR, Strings.rTrim(input), T.tString);
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
      Assert.eq('leftTrim', Strings.lTrim(' ' + s), Strings.lTrim(s), T.tString);
    }
  ));
});

UnitTest.test('rightTrim(s + whitespace) === rightTrim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('rightTrim', Strings.rTrim(s + ' '), Strings.rTrim(s), T.tString);
    }
  ));
});

UnitTest.test('trim(whitespace + s) === trim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('trim', Strings.trim(' ' + s), Strings.trim(s), T.tString);
    }
  ));
});

UnitTest.test('trim(s + whitespace) === trim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('trim', Strings.trim(s + ' '), Strings.trim(s), T.tString);
    }
  ));
});

UnitTest.test('trim(whitespace + s + whitespace) === trim(s)', () => {
  fc.assert(fc.property(
    fc.string(),
    (s) => {
      Assert.eq('trim', Strings.trim(' ' + s + ' '), Strings.trim(s), T.tString);
    }
  ));
});
