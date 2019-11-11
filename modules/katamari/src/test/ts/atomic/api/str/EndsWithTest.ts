import * as Strings from 'ephox/katamari/api/Strings';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('endsWith: Unit tests', () => {
  const check = (expected, str, suffix) => {
    const actual = Strings.endsWith(str, suffix);
    Assert.eq('endsWith', expected, actual);
  };

  check(true, '', '');
  check(true, 'a', '');
  check(true, 'a', 'a');
  check(true, 'ab', 'b');
  check(true, 'abc', 'bc');

  check(false, '', 'a');
  check(false, 'caatatetatat', 'cat');
});

UnitTest.test('endsWith: A string added to a string (at the end) must have endsWith as true', () => {
  fc.assert(fc.property(
    fc.asciiString(),
    fc.asciiString(),
    (str, contents) => Strings.endsWith(str + contents, contents)
  ));
});
