import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional, Optionals } from '@ephox/katamari';

import { WordScope } from 'ephox/robin/data/WordScope';
import * as WordSanitiser from 'ephox/robin/util/WordSanitiser';

UnitTest.test('Word Sanitiser', () => {
  const some = Optional.some;

  const ss = (word: string, v1: string, v2: string) => {
    return WordScope(word, some(v1), some(v2));
  };

  const check = (expected: WordScope, input: WordScope) => {
    const actual = WordSanitiser.scope(input);
    Assert.eq('', expected.word, actual.word);
    Assert.eq('', true, Optionals.equals(expected.left, actual.left));
    Assert.eq('', true, Optionals.equals(expected.right, actual.right));
  };

  check(ss('one', '<', '>'), ss('one', '<', '>'));
  check(ss('one', '<', `'`), ss(`one'`, '<', '>'));
  check(ss('one', `'`, '>'), ss(`'one`, '<', '>'));
  check(ss(`'twas`, '<', '>'), ss(`'twas`, '<', '>'));
  check(ss(`'twas`, `'`, `'`), ss(`''twas'`, '<', '>'));
  check(ss(`''one''`, '<', '>'), ss(`''one''`, '<', '>'));
  check(ss(`'twas`, `'`, '>'), ss(`''twas`, '<', '>'));

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
