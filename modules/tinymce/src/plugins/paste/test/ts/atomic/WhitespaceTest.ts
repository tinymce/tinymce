import { describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as Whitespace from 'tinymce/plugins/paste/core/Whitespace';

describe('atomic.tinymce.plugins.paste.WhitespaceTest', () => {
  const settings = { paste_tab_spaces: 2 };
  const mockEditor = {
    getParam: (name, defaultValue) => Obj.get(settings, name).getOr(defaultValue)
  } as Editor;

  it('normalizeWhitespace', () => {
    const check = (label: string, expected: string, input: string) => {
      assert.equal(Whitespace.normalizeWhitespace(mockEditor, input), expected, label);
    };

    const single = 'onelineofsmashedtogetherwords';
    const windows = 'one\r\ntwo\r\n\r\nthree';
    const others = 'twenty four \n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine';
    const mixed = windows + '\n\n' + others;
    const leadingSpaces = '\n\n one\n two\n\n three\n\n';
    const trailingSpaces = '\n\none \ntwo \n\nthree \n\n';
    const sequentialSpaces = '\n\n  one   two  \n\nthree';
    const withTabs = ' \tone\t';
    const withSequentialTabs = '\t\t\tone\t\t ';

    check('single line', single, single);
    check('with windows line endings', 'one\r\ntwo\r\n\r\nthree', windows);
    check('with linux/mac line endings', 'twenty four\u00a0\n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine', others);
    check('with mixed line endings', 'one\r\ntwo\r\n\r\nthree\n\ntwenty four\u00a0\n\n\ntwenty five\n\n\n\n\n\n\n\n\n\n\n\ntwenty nine', mixed);
    check('with leading spaces', '\n\n\u00a0one\n\u00a0two\n\n\u00a0three\n\n', leadingSpaces);
    check('with trailing spaces', '\n\none\u00a0\ntwo\u00a0\n\nthree\u00a0\n\n', trailingSpaces);
    check('with sequential spaces', '\n\n\u00a0 one \u00a0 two \u00a0\n\nthree', sequentialSpaces);
    check('with tabs', '\u00a0 \u00a0one \u00a0', withTabs);
    check('with sequential tabs', '\u00a0 \u00a0 \u00a0 one \u00a0 \u00a0\u00a0', withSequentialTabs);
  });
});
