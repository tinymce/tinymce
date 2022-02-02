import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional, Unicode } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as WordUtil from 'ephox/robin/util/WordUtil';

UnitTest.test('Word Util', () => {
  const checkNone = (text: string, word: (w: string) => Optional<string>) => {
    const actual = word(text);
    KAssert.eqNone('eq', actual);
  };

  const check = (expected: string, text: string, word: (w: string) => Optional<string>) => {
    const actual = word(text);
    KAssert.eqSome('eq', expected, actual);
  };

  const checkBreak = (expected: boolean, text: string) => {
    const actual = WordUtil.hasBreak(text);
    Assert.eq('eq', expected, actual);
  };

  const checkBreakPosition = (expected: Optional<number>, text: string, direction: (w: string) => Optional<number>) => {
    const actual = direction(text);
    KAssert.eqOptional('eq', expected, actual);
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

  checkBreakPosition(Optional.none(), '', WordUtil.leftBreak);
  checkBreakPosition(Optional.none(), 'word', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(0), ' ', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(0), ' word', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(4), 'word ', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(4), 'word ' + Unicode.zeroWidth + '', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(0), ' ' + Unicode.zeroWidth + 'word', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(0), ' ' + Unicode.zeroWidth + '' + Unicode.zeroWidth + 'word', WordUtil.leftBreak);
  checkBreakPosition(Optional.some(0), ' ' + Unicode.zeroWidth + 'wo' + Unicode.zeroWidth + 'rd', WordUtil.leftBreak);
});
