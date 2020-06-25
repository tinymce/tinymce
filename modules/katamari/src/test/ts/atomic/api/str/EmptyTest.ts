import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Strings from 'ephox/katamari/api/Strings';
import fc from 'fast-check';

UnitTest.test('isEmpty: unit test', () => {
  const check = (expected, str) => {
    Assert.eq('isEmpty', expected, Strings.isEmpty(str));
  };

  check(false, 'a');
  check(false, ' ');
  check(true, '');
});

UnitTest.test('isNotEmpty: unit test', () => {
  const check = (expected, str) => {
    Assert.eq('isNotEmpty', expected, Strings.isNotEmpty(str));
  };

  check(true, 'a');
  check(true, ' ');
  check(false, '');
});

UnitTest.test('A string with length 1 or larger should never be empty', () => {
  fc.assert(fc.property(fc.string(1, 40), (str) => {
    Assert.eq('isEmpty', false, Strings.isEmpty(str));
    Assert.eq('isNotEmpty', true, Strings.isNotEmpty(str));
  }));
});
