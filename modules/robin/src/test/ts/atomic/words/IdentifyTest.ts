import { Assert, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Optionals } from '@ephox/katamari';

import { WordScope } from 'ephox/robin/data/WordScope';
import * as Identify from 'ephox/robin/words/Identify';

describe('atomic.robin.words.IdentifyTest', () => {
  const none = Optional.none<string>();
  const some = Optional.some;

  const check = (expected: WordScope[], input: string) => {
    const actual = Identify.words(input);
    Assert.eq(`Checking length of result for "${input}"`, expected.length, actual.length);
    Arr.map(expected, (_, i) => {
      Assert.eq(`Checking result of word for "${expected[i].word}"`, expected[i].word, actual[i].word);
      Assert.eq(`Checking result of left for expected: "${expected[i].left.getOr('')}", actual: "${actual[i].left.getOr('')}"`, true, Optionals.equals(expected[i].left, actual[i].left));
      Assert.eq(`Checking result of right for expected:"${expected[i].right.getOr('')}", actual: "${actual[i].right.getOr('')}"`, true, Optionals.equals(expected[i].right, actual[i].right));
    });
  };

  const checkWords = (expected: string[], input: string) => {
    const actual = Identify.words(input);
    Assert.eq('', expected, Arr.map(actual, (a) => {
      return a.word;
    }));
  };

  it('TINY-10062: Check word', () => {
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

    check([
      WordScope('<p>', none, some(' ')),
      WordScope('Hello', some(' '), some(' ')),
      WordScope('World<', some(' '), some('/')),
      WordScope('p>', some('/'), none),
    ], '<p> Hello World</p>');

    check([
      WordScope('<p>', none, some(' ')),
      WordScope('Hello', some(' '), some(' ')),
      WordScope('World', some(' '), some(' ')),
      WordScope('<', some(' '), some('/')),
      WordScope('p>', some('/'), none),
    ], '<p> Hello World </p>');

    check([
      WordScope('<p>Hello', none, some(' ')),
      WordScope('World', some(' '), some(' ')),
      WordScope('<', some(' '), some('/')),
      WordScope('p>', some('/'), none),
    ], '<p>Hello World </p>');

    check([
      WordScope('<p>Hello', none, some(' ')),
      WordScope('World<', some(' '), some('/')),
      WordScope('p>', some('/'), none),
    ], '<p>Hello World</p>');

    check([
      WordScope('Test', none, some('.')),
      WordScope('IF:INTEXT', some('['), some(']')),
      WordScope('Test2', some(']'), some(' ')),
      WordScope('IF', some('/'), some(']')),
    ], 'Test. [IF:INTEXT]Test2 [/IF]');

    check([
      WordScope('Test', none, some('.')),
      WordScope('IF', some('/'), some(']')),
      WordScope('Test2', some(']'), some(' ')),
      WordScope('IF:INTEXT', some('['), some(']')),
    ], 'Test. [/IF]Test2 [IF:INTEXT]');
  });

  it('TINY-10062: Check words', () => {
    // Note, the smart quotes.
    checkWords(
      [ 'Tale', 'is', 'about', 'an', 'adorable', 'mouse', 'with', 'a', 'lute',
        'fighting', 'giant', 'crabs', 'Really', 'I’d', 'hope', 'that', 'was',
        'enough', 'for', 'you', 'but', 'I\u2019ll', 'throw' ],
      'Tale is about an adorable mouse with a lute fighting giant crabs. ' +
      'Really I’d hope that was enough for you, but I\u2019ll throw');

  });
});
