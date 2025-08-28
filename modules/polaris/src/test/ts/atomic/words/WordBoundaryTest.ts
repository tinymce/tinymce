import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as StringMapper from 'ephox/polaris/words/StringMapper';
import * as WordBoundary from 'ephox/polaris/words/WordBoundary';

UnitTest.test('Words.WordBoundaryTest', () => {
  const iwb = (str: string, index: number) => {
    return WordBoundary.isWordBoundary(StringMapper.classify(str.split('')), index);
  };

  const testWordBoundary = () => {
    // should not break between most characters
    Assert.eq('', false, iwb('abc', 1));
    Assert.eq('', false, iwb('åäö', 1));
    Assert.eq('', false, iwb('üßœ', 1));

    // should not break some punctuation
    Assert.eq('', false, iwb(`can't`, 2));
    Assert.eq('', false, iwb('can’t', 2));
    Assert.eq('', false, iwb('foo.bar', 2));
    Assert.eq('', false, iwb('foo:bar', 2));

    // shouldn't break on characters attached to numbers
    Assert.eq('', false, iwb('123', 1));
    Assert.eq('', false, iwb('a123', 1));
    Assert.eq('', false, iwb('1a23', 1));

    // shouldn't break on punctuation in number sequences
    Assert.eq('', false, iwb('3.14', 1));
    Assert.eq('', false, iwb('1,024', 1));
    Assert.eq('', false, iwb('5-1', 1));

    // should extend characters
    Assert.eq('', false, iwb('foo\u00ADbar', 2));
    Assert.eq('', false, iwb('foo\u0300bar', 2));

    // Should NOT break in Katakana
    Assert.eq('', false, iwb('カラテ', 1));
    // Should break between every kanji
    Assert.eq('', true, iwb('空手道', 1));

    // Shouldn't break inside CRLF
    Assert.eq('', false, iwb('foo\r\nbar', 3));

    // Should break before newlines
    Assert.eq('', true, iwb('foo\rbar', 2));
    Assert.eq('', true, iwb('foo\nbar', 2));
    Assert.eq('', true, iwb('foo\r\nbar', 2));

    // should break after newlines
    Assert.eq('', true, iwb('foo\rbar', 3));
    Assert.eq('', true, iwb('foo\nbar', 3));
    Assert.eq('', true, iwb('foo\r\nbar', 4));

    // shouldn't break from extenders
    Assert.eq('', false, iwb('foo_bar', 2));
    Assert.eq('', false, iwb('__', 0));

    // Should break anywhere else
    Assert.eq('', true, iwb('foo bar', 2));
    Assert.eq('', true, iwb('foo\tbar', 2));
    Assert.eq('', true, iwb('foo&bar', 2));
    Assert.eq('', true, iwb('foo"bar"', 2));
    Assert.eq('', true, iwb('foo(bar)', 2));
    Assert.eq('', true, iwb('foo/bar', 2));

    // should return false when given out of bounds index
    Assert.eq('', false, iwb('', 5));
    Assert.eq('', false, iwb('', -1));

    // should return true for empty string
    Assert.eq('', true, iwb('', 0));
  };

  testWordBoundary();
});
