import * as Whitespace from 'tinymce/plugins/paste/core/Whitespace';
import { UnitTest, assert } from '@ephox/bedrock-client';

UnitTest.test('atomic.tinymce.plugins.paste.WhitespaceTest', () => {
  const check = (expected: string, input: string) => assert.eq(expected, Whitespace.normalizeWhitespace(input));

  const single = 'onelineofsmashedtogetherwords';
  const windows = 'one\r\ntwo\r\n\r\nthree';
  const others = 'twenty four \n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine';
  const mixed = windows + '\n\n' + others;
  const leadingSpaces = '\n\n one\n two\n\n three\n\n';
  const trailingSpaces = '\n\none \ntwo \n\nthree \n\n';
  const sequentialSpaces = '\n\n  one   two  \n\nthree';

  check(single, single);
  check('one\r\ntwo\r\n\r\nthree', windows);
  check('twenty four\u00a0\n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine', others);
  check('one\r\ntwo\r\n\r\nthree\n\ntwenty four\u00a0\n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine', mixed);
  check('\n\n\u00a0one\n\u00a0two\n\n\u00a0three\n\n', leadingSpaces);
  check('\n\none\u00a0\ntwo\u00a0\n\nthree\u00a0\n\n', trailingSpaces);
  check('\n\n\u00a0 one \u00a0 two \u00a0\n\nthree', sequentialSpaces);
});
