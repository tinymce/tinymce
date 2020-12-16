import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Strings from 'ephox/katamari/api/Strings';

UnitTest.test('ensureTrailing: unit tests', () => {
  const check = (expected: string, str: string, suffix: string) => {
    const actual = Strings.ensureTrailing(str, suffix);
    Assert.eq('ensureTrailing', expected, actual);
  };

  check('', '', '');
  check('a', 'a', 'a');
  check('aab', 'a', 'ab');
  check('cat/', 'cat', '/');
  check('cat/', 'cat/', '/');
  check('/', '', '/');
});

UnitTest.test('ensureTrailing is identity if string already ends with suffix', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(),
    (prefix, suffix) => {
      const s = prefix + suffix;
      Assert.eq('id', s, Strings.ensureTrailing(s, suffix));
    }));
});

UnitTest.test('ensureTrailing endsWith', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(),
    (s, suffix) => Strings.endsWith(Strings.ensureTrailing(s, suffix), suffix)
  ));
});
