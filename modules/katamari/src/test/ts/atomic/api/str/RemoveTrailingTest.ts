import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('removeTrailing: unit tests', () => {
  function check(expected, str, trail) {
    const actual = Strings.removeTrailing(str, trail);
    Assert.eq('removeTrailing', expected, actual);
  }

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
