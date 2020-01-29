import * as Strings from 'ephox/katamari/api/Strings';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as fc from 'fast-check';

UnitTest.test('startsWith: unit tests', () => {
  const check = (expected, str, prefix) => {
    const actual = Strings.startsWith(str, prefix);
    Assert.eq('startsWith', expected, actual);
  };

  check(true, '', '');
  check(true, 'a', '');
  check(true, 'a', 'a');
  check(true, 'ab', 'a');
  check(true, 'abc', 'ab');

  check(false, '', 'a');
  check(false, 'caatatetatat', 'cat');
});

UnitTest.test('startsWith: property test', () => {
  fc.assert(fc.property(
    fc.asciiString(),
    fc.asciiString(),
    (str, contents) => Strings.startsWith(contents + str, contents)
  ));
});
