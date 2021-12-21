import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Whitespace from 'tinymce/core/text/Whitespace';

describe('atomic.tinymce.core.text.WhitespaceTest', () => {
  it('normalize', () => {
    const check = (label: string, expected: string, input: string) => {
      assert.equal(Whitespace.normalize(input, 2), expected, label);
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
