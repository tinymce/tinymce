import { assert, UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Whitespace from 'tinymce/plugins/paste/core/Whitespace';

UnitTest.test('atomic.tinymce.plugins.paste.WhitespaceTest', () => {
  const settings = { paste_tab_spaces: 2 };
  const mockEditor = {
    getParam: (name, defaultValue) => Obj.get(settings, name).getOr(defaultValue)
  } as Editor;

  const check = (expected: string, input: string) => assert.eq(expected, Whitespace.normalizeWhitespace(mockEditor, input));

  const single = 'onelineofsmashedtogetherwords';
  const windows = 'one\r\ntwo\r\n\r\nthree';
  const others = 'twenty four \n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine';
  const mixed = windows + '\n\n' + others;
  const leadingSpaces = '\n\n one\n two\n\n three\n\n';
  const trailingSpaces = '\n\none \ntwo \n\nthree \n\n';
  const sequentialSpaces = '\n\n  one   two  \n\nthree';
  const withTabs = ' \tone\t';
  const withSequentialTabs = '\t\t\tone\t\t ';

  check(single, single);
  check('one\r\ntwo\r\n\r\nthree', windows);
  check('twenty four\u00a0\n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine', others);
  check('one\r\ntwo\r\n\r\nthree\n\ntwenty four\u00a0\n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine', mixed);
  check('\n\n\u00a0one\n\u00a0two\n\n\u00a0three\n\n', leadingSpaces);
  check('\n\none\u00a0\ntwo\u00a0\n\nthree\u00a0\n\n', trailingSpaces);
  check('\n\n\u00a0 one \u00a0 two \u00a0\n\nthree', sequentialSpaces);
  check('\u00a0 \u00a0one \u00a0', withTabs);
  check('\u00a0 \u00a0 \u00a0 one \u00a0 \u00a0\u00a0', withSequentialTabs);
});
