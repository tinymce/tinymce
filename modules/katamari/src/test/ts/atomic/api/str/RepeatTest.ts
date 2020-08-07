import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Strings from 'ephox/katamari/api/Strings';

UnitTest.test('Strings.repeat: unit tests', () => {
  Assert.eq('Repeat with positive string', '*****', Strings.repeat('*', 5));
  Assert.eq('Repeat with 0 should be an empty string', '', Strings.repeat(' ', 0));
  Assert.eq('Repeat with negative should be an empty string', '', Strings.repeat('-', -1));
});

UnitTest.test('Strings.repeat: positive range', () => {
  fc.assert(fc.property(fc.char(), fc.integer(1, 100), (s, count) => {
    const actual = Strings.repeat(s, count);
    Assert.eq('length should be the same as count', count, actual.length);
    Assert.eq('first char should be the same', s, actual.charAt(0));
    Assert.eq('last char should be the same', s, actual.charAt(actual.length - 1));
  }));
});

UnitTest.test('Strings.repeat: negative range', () => {
  fc.assert(fc.property(fc.char(), fc.integer(-100, 0), (s, count) => {
    const actual = Strings.repeat(s, count);
    Assert.eq('length should be 0', 0, actual.length);
    Assert.eq('should be an empty string', '', actual);
  }));
});
