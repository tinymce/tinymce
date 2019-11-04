import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, assert, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tString } = Testable;

UnitTest.test('capitalize: unit tests', function () {
  function check(expected, input) {
    const actual = Strings.capitalize(input);
    Assert.eq('capitalize', expected, actual, tString);
  }

  check('', '');
  check('A', 'a');
  check('A', 'A');
  check('Abc', 'abc');
  check('Abc', 'Abc');
  check('ABC', 'ABC');
  check('CBA', 'CBA');
  check('CBA', 'cBA');
});

UnitTest.test('capitalize: tail of the string is unchanged', () => {
  fc.assert(fc.property(fc.asciiString(1, 30), (s) => {
    Assert.eq('tail', s.substring(1), Strings.capitalize(s).substring(1), tString);
  }));
});

UnitTest.test('capitalize: head is uppercase', () => {
  fc.assert(fc.property(fc.asciiString(1, 30), (s) => {
    const h = Strings.capitalize(s).charAt(0);
    Assert.eq('head is uppercase', h.toUpperCase(), h, tString);
  }));
});
