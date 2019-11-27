import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Option, Unicode } from '@ephox/katamari';
import WordUtil from 'ephox/robin/util/WordUtil';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('Word Util', function () {
  const checkNone = function (text: string, word: (w: string) => Option<string>) {
    const actual = word(text);
    KAssert.eqNone('eq', actual);
  };

  const check = function (expected: string, text: string, word: (w: string) => Option<string>) {
    const actual = word(text);
    KAssert.eqSome('eq', expected, actual);
  };

  const checkBreak = function (expected: boolean, text: string) {
    const actual = WordUtil.hasBreak(text);
    Assert.eq('eq', expected, actual);
  };

  const checkBreakPosition = function (expected: Option<number>, text: string, direction: (w: string) => Option<number>) {
    const actual = direction(text);
    KAssert.eqOption('eq', expected, actual);
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

  checkBreakPosition(Option.none(), '', WordUtil.leftBreak);
  checkBreakPosition(Option.none(), 'word', WordUtil.leftBreak);
  checkBreakPosition(Option.some(0), ' ', WordUtil.leftBreak);
  checkBreakPosition(Option.some(0), ' word', WordUtil.leftBreak);
  checkBreakPosition(Option.some(4), 'word ', WordUtil.leftBreak);
  checkBreakPosition(Option.some(4), 'word ' + Unicode.zeroWidth + '', WordUtil.leftBreak);
  checkBreakPosition(Option.some(0), ' ' + Unicode.zeroWidth + 'word', WordUtil.leftBreak);
  checkBreakPosition(Option.some(0), ' ' + Unicode.zeroWidth + '' + Unicode.zeroWidth + 'word', WordUtil.leftBreak);
  checkBreakPosition(Option.some(0), ' ' + Unicode.zeroWidth + 'wo' + Unicode.zeroWidth + 'rd', WordUtil.leftBreak);
});
