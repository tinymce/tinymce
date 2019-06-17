import { assert, UnitTest } from '@ephox/bedrock';
import { Option, Unicode } from '@ephox/katamari';
import WordUtil from 'ephox/robin/util/WordUtil';

UnitTest.test('Word Util', function () {
  const checkNone = function (text: string, word: (w: string) => Option<string>) {
    const actual = word(text);
    assert.eq(true, actual.isNone());
  };

  const check = function (expected: string, text: string, word: (w: string) => Option<string>) {
    const actual = word(text);
    actual.fold(function () {
      assert.fail('Expected: ' + expected + ' but received nothing.');
    }, function (v) {
      assert.eq(expected, v);
    });
  };

  const checkBreak = function (expected: boolean, text: string) {
    const actual = WordUtil.hasBreak(text);
    assert.eq(expected, actual);
  };

  const checkBreakPosition = function (expected: number | null, text: string, direction: (w: string) => Option<number>) {
    const actual = direction(text);
    assert.eq(expected, actual.getOrNull());
  };

  checkNone('ballast', WordUtil.firstWord);
  checkNone('ballast', WordUtil.lastWord);
  check(' one', 'ballast one', WordUtil.lastWord);
  check(' one', 'ballast  one', WordUtil.lastWord);
  check(' d', 'a b c d', WordUtil.lastWord);
  check('one ', 'one ballast', WordUtil.firstWord);
  check('one ', 'one two three ', WordUtil.firstWord);
  check(' ', '  o pp qq', WordUtil.firstWord);
  check('apple ', 'apple bear cat', WordUtil.firstWord);
  check('apple ', 'apple ', WordUtil.firstWord);

  checkBreak(false, 'apple');
  checkBreak(true, 'apple ');
  checkBreak(true, ' apple');
  checkBreak(true, 'apples and oranges');
  checkBreak(false, '');
  checkBreak(false, 'applesandoranges');

  checkBreakPosition(null, '', WordUtil.leftBreak);
  checkBreakPosition(null, 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ', WordUtil.leftBreak);
  checkBreakPosition(0, ' word', WordUtil.leftBreak);
  checkBreakPosition(4, 'word ', WordUtil.leftBreak);
  checkBreakPosition(4, 'word ' + Unicode.zeroWidth() + '', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + Unicode.zeroWidth() + 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + Unicode.zeroWidth() + '' + Unicode.zeroWidth() + 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + Unicode.zeroWidth() + 'wo' + Unicode.zeroWidth() + 'rd', WordUtil.leftBreak);
});