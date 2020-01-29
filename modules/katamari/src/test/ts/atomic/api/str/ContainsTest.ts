import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('contains: unit test', () => {
  function check(expected, str, substr) {
    const actual = Strings.contains(str, substr);
    Assert.eq('contains', expected, actual);
  }

  check(false, 'a', 'b');
  check(false, 'cat', 'dog');
  check(false, 'abc', 'x');
  check(false, '', 'x');
  check(true, '', '');
  check(true, 'cat', '');
  check(true, 'a', 'a');
  check(true, 'ab', 'ab');
  check(true, 'ab', 'a');
  check(true, 'ab', 'b');
  check(true, 'abc', 'b');
});

UnitTest.test('A string added to a string (at the end) must be contained within it', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(1, 40),
    (str, contents) => {
      const r = str + contents;
      Assert.eq('eq', true, Strings.contains(r, contents));
    }
  ));
});

UnitTest.test('A string added to a string (at the start) must be contained within it', () => {
  fc.assert(fc.property(
    fc.string(),
    fc.string(1, 40),
    (str, contents) => {
      const r = contents = str;
      Assert.eq('eq', true, Strings.contains(r, contents));
    }
  ));
});

UnitTest.test('An empty string should contain nothing', () => {
  fc.assert(fc.property(
    fc.string(1, 40),
    (value) => !Strings.contains('', value)
  ));
});
