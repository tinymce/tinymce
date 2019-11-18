import * as Strings from 'ephox/katamari/api/Strings';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tString } = Testable;

UnitTest.test('capitalize: unit tests', () => {
  const check = (expected, input) => {
    const actual = Strings.capitalize(input);
    Assert.eq('capitalize', expected, actual, tString);
  };

  check('', '');
  check('A', 'a');
  check('A', 'A');
  check('Abc', 'abc');
  check('Abc', 'Abc');
  check('ABC', 'ABC');
  check('CBA', 'CBA');
  check('CBA', 'cBA');
  check('Frog', 'frog');
});

UnitTest.test('capitalize: tail of the string is unchanged', () => {
  fc.assert(fc.property(fc.ascii(), fc.asciiString(30), (h, t) => {
    Assert.eq('tail', t, Strings.capitalize(h + t).substring(1), tString);
  }));
});

UnitTest.test('capitalize: head is uppercase', () => {
  fc.assert(fc.property(fc.ascii(), fc.asciiString(30), (h, t) => {
    const actualH = Strings.capitalize(h + t).charAt(0);
    Assert.eq('head is uppercase', h.toUpperCase(), actualH, tString);
  }));
});
