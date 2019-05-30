import { Unicode } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import WordUtil from 'ephox/robin/util/WordUtil';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Word Util', function() {
  var checkNone = function (text, word) {
    var actual = word(text);
    assert.eq(true, actual.isNone());
  };

  var check = function (expected, text, word) {
    var actual = word(text);
    actual.fold(function () {
      actual.equals(expected) ? true : assert.fail('Expected: ' + expected + ' but received nothing.');
    }, function (v) {
      assert.eq(expected, v);
    });
  };

  var checkBreak = function (expected, text) {
    var actual = WordUtil.hasBreak(text);
    assert.eq(expected, actual);
  };

  var checkBreakPosition = function (expected, text, direction) {
    var actual = direction(text);
    actual.fold(function () {
      actual.equals(expected) ? true : assert.fail('Expected: ' + expected + ' and got none.');
    }, function (i) {
      assert.eq(expected, i);
    });
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
  checkBreakPosition(0, ' ', WordUtil.leftBreak);
  checkBreakPosition(0, ' word', WordUtil.leftBreak);
  checkBreakPosition(4, 'word ', WordUtil.leftBreak);
  checkBreakPosition(4, 'word ' + Unicode.zeroWidth() + '', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + Unicode.zeroWidth() + 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + Unicode.zeroWidth() + '' + Unicode.zeroWidth() + 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + Unicode.zeroWidth() + 'wo' + Unicode.zeroWidth() + 'rd', WordUtil.leftBreak);
});

