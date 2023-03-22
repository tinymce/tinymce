import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional, Optionals } from '@ephox/katamari';

import { WordScope } from 'ephox/robin/data/WordScope';
import * as Identify from 'ephox/robin/words/Identify';

UnitTest.test('words :: Identify', () => {
  const none = Optional.none<string>();
  const some = Optional.some;

  const check = (expected: WordScope[], input: string) => {
    const actual = Identify.words(input);
    Assert.eq('', expected.length, actual.length);
    Arr.map(expected, (x, i) => {
      Assert.eq('', expected[i].word, actual[i].word);
      Assert.eq('', true, Optionals.equals(expected[i].left, actual[i].left));
      Assert.eq('', true, Optionals.equals(expected[i].right, actual[i].right));
    });
  };

  const checkWords = (expected: string[], input: string) => {
    const actual = Identify.words(input);
    Assert.eq('', expected, Arr.map(actual, (a) => {
      return a.word;
    }));
  };

  check([], '');
  check([], ' ');
  check([ WordScope('one', none, none) ], 'one');
  check([ WordScope('this', some('('), some(')')) ], '(this)');
  check([ WordScope(`don't`, some(' '), some(' ')) ], ` don't `);
  check([
    WordScope('it', some('"'), some(' ')),
    WordScope('is', some(' '), some(' ')),
    WordScope('a', some(' '), some(' ')),
    WordScope('good', some(' '), some(' ')),
    WordScope('day', some(' '), some(' ')),
    WordScope('to', some(' '), some(' ')),
    WordScope('live', some(' '), some('"'))
  ], '"it is a good day to live"');
  check([
    WordScope(`twas`, some(`'`), some(' ')),
    WordScope('the', some(' '), some(' ')),
    WordScope('night', some(' '), some(' ')),
    WordScope('before', some(' '), none)
  ], ` 'twas the night before`);

  check([
    WordScope('this', some(`'`), some(' ')),
    WordScope('the', some(' '), some(' ')),
    WordScope('night', some(' '), some(' ')),
    WordScope('before', some(' '), none)
  ], ` 'this the night before`);

  // Note, the smart quotes.
  checkWords(
    [ 'Tale', 'is', 'about', 'an', 'adorable', 'mouse', 'with', 'a', 'lute',
      'fighting', 'giant', 'crabs', 'Really', 'I’d', 'hope', 'that', 'was',
      'enough', 'for', 'you', 'but', 'I\u2019ll', 'throw' ],
    'Tale is about an adorable mouse with a lute fighting giant crabs. ' +
    'Really I’d hope that was enough for you, but I\u2019ll throw');

  // TINY-9654: Identify words containing non-latin characters
  check([ WordScope('привет', none, none) ], 'привет');
  check([ WordScope('привет', some(' '), some(' ')) ], ' привет ');
  check([
    WordScope('привет', some('"'), some(' ')),
    WordScope('world', some(' '), some('"'))
  ], '"привет world"');
  check([
    WordScope('Here', none, some(' ')),
    WordScope('is', some(' '), some(' ')),
    WordScope('a', some(' '), some(' ')),
    WordScope('mixed', some(' '), some(' ')),
    WordScope('word', some(' '), some(' ')),
    WordScope('Mixedприmixedве\u2019т123', some(' '), some(`'`))
  ], `Here is a mixed word Mixedприmixedве\u2019т123'`);
});
