import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('ensureLeading', () => {
  function check(expected, str, prefix) {
    const actual = Strings.ensureLeading(str, prefix);
    Assert.eq('ensureLeading', expected, actual);
  }

  check('', '', '');
  check('a', 'a', 'a');
  check('ab', 'ab', 'a');
  check('ab', 'b', 'a');
  check('a', '', 'a');
});

UnitTest.test('startsWith a prefix', () => {
  fc.assert(fc.property(fc.string(), fc.string(),
    (prefix, suffix) => Strings.startsWith(prefix + suffix, prefix)
  ));
});
