import { assert, UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { WordScope } from 'ephox/robin/data/WordScope';
import WordSanitiser from 'ephox/robin/util/WordSanitiser';

UnitTest.test('Word Sanitiser', function () {
  const some = Option.some;

  const ss = function (word: string, v1: string, v2: string) {
    return WordScope(word, some(v1), some(v2));
  };

  const check = function (expected: WordScope, input: WordScope) {
    const actual = WordSanitiser.scope(input);
    assert.eq(expected.word(), actual.word());
    assert.eq(true, expected.left().equals(actual.left()));
    assert.eq(true, expected.right().equals(actual.right()));
  };

  check(ss('one', '<', '>'), ss('one', '<', '>'));
  check(ss('one', '<', '\''), ss('one\'', '<', '>'));
  check(ss('one', '\'', '>'), ss('\'one', '<', '>'));
  check(ss('\'twas', '<', '>'), ss('\'twas', '<', '>'));
  check(ss('\'twas', '\'', '\''), ss('\'\'twas\'', '<', '>'));
  check(ss('\'\'one\'\'', '<', '>'), ss('\'\'one\'\'', '<', '>'));
  check(ss('\'twas', '\'', '>'), ss('\'\'twas', '<', '>'));

  check(ss('one', '<', '>'), ss('one', '<', '>'));
  check(ss('one', '<', '\u2018'), ss('one\u2018', '<', '>'));
  check(ss('one', '\u2018', '>'), ss('\u2018one', '<', '>'));
  check(ss('\u2018twas', '<', '>'), ss('\u2018twas', '<', '>'));
  check(ss('\u2018twas', '\u2018', '\u2018'), ss('\u2018\u2018twas\u2018', '<', '>'));
  check(ss('\u2018\u2018one\u2018\u2018', '<', '>'), ss('\u2018\u2018one\u2018\u2018', '<', '>'));
  check(ss('\u2018twas', '\u2018', '>'), ss('\u2018\u2018twas', '<', '>'));

  check(ss('one', '<', '>'), ss('one', '<', '>'));
  check(ss('one', '<', '\u2019'), ss('one\u2019', '<', '>'));
  check(ss('one', '\u2019', '>'), ss('\u2019one', '<', '>'));
  check(ss('\u2019twas', '<', '>'), ss('\u2019twas', '<', '>'));
  check(ss('\u2019twas', '\u2019', '\u2019'), ss('\u2019\u2019twas\u2019', '<', '>'));
  check(ss('\u2019\u2019one\u2019\u2019', '<', '>'), ss('\u2019\u2019one\u2019\u2019', '<', '>'));
  check(ss('\u2019twas', '\u2019', '>'), ss('\u2019\u2019twas', '<', '>'));
});
