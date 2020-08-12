import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Strings from 'ephox/katamari/api/Strings';
import fc from 'fast-check';

UnitTest.test('Strings.repeat: unit tests', () => {
  Assert.eq('Repeat with positive string', '*****', Strings.repeat('*', 5));
  Assert.eq('Repeat with 0 should be an empty string', '', Strings.repeat(' ', 0));
  Assert.eq('Repeat with negative should be an empty string', '', Strings.repeat('-', -1));
});

UnitTest.test('Strings.repeat: positive range', () => {
  fc.assert(fc.property(fc.char(), fc.integer(1, 100), (c, count) => {
    const actual = Strings.repeat(c, count);
    Assert.eq('length should be the same as count', count, actual.length);
    Assert.eq('first char should be the same', c, actual.charAt(0));
    Assert.eq('last char should be the same', c, actual.charAt(actual.length - 1));
  }));

  fc.assert(fc.property(fc.asciiString(5), fc.integer(1, 100), (s, count) => {
    const actual = Strings.repeat(s, count);
    Assert.eq('length should be count * original length', count * s.length, actual.length);
    Assert.eq('should start with string', 0, actual.indexOf(s));
    Assert.eq('should end with string', actual.length - s.length, actual.lastIndexOf(s));
  }));
});

UnitTest.test('Strings.repeat: negative range', () => {
  fc.assert(fc.property(fc.char(), fc.integer(-100, 0), (c, count) => {
    const actual = Strings.repeat(c, count);
    Assert.eq('length should be 0', 0, actual.length);
    Assert.eq('should be an empty string', '', actual);
  }));
});
