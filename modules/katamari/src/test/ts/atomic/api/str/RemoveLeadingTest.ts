import * as Strings from 'ephox/katamari/api/Strings';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('removeLeading: unit tests', () => {
  const check = (expected, str, trail) => {
    const actual = Strings.removeLeading(str, trail);
    Assert.eq('removeLeading', expected, actual);
  };

  check('', '', '');
  check('cat', 'cat', '');
  check('', '', '/');
  check('cat', '/cat', '/');
  check('', 'cat/', 'cat/');
  check('dog', 'catdog', 'cat');
});

UnitTest.test('removeLeading removes prefix', () => {
  fc.assert(fc.property(
    fc.asciiString(),
    fc.asciiString(),
    (prefix, suffix) => {
      Assert.eq('removeLeading', suffix, Strings.removeLeading(prefix + suffix, prefix));
    }
  ));
});
