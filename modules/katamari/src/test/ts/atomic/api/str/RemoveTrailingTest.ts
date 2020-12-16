import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Strings from 'ephox/katamari/api/Strings';

UnitTest.test('removeTrailing: unit tests', () => {
  const check = (expected: string, str: string, trail: string) => {
    const actual = Strings.removeTrailing(str, trail);
    Assert.eq('removeTrailing', expected, actual);
  };

  check('', '', '');
  check('cat', 'cat', '');
  check('', '', '/');
  check('cat', 'cat/', '/');
  check('', 'cat/', 'cat/');
});

UnitTest.test('removeTrailing property', () => {
  fc.assert(fc.property(
    fc.asciiString(),
    fc.asciiString(),
    (prefix, suffix) => {
      Assert.eq('removeTrailing', prefix, Strings.removeTrailing(prefix + suffix, suffix));
    }
  ));
});
