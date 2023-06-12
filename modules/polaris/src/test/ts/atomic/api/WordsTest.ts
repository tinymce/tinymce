import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import { getWords, WordOptions } from 'ephox/polaris/words/Words';

UnitTest.test('api.Words.words', () => {
  interface Char {
    char: string;
  }

  const parseString = (str: string): Char[] => Arr.map(str.split(''), (char) => ({ char }));

  // In order to simplify the assertions
  const simplifySets = (charSets: Char[][]): string[] => Arr.map(charSets, (set) => Arr.map(set, (char) => char.char).join(''));

  const assertWords = (expected: string[], input: string, options?: WordOptions) => {
    const chars: Char[] = parseString(input);
    const wordSets: Char[][] = getWords(chars, (char) => char.char, options);
    const actual = simplifySets(wordSets);

    Assert.eq('', expected, actual);
  };

  // splits words on whitespace
  assertWords([ 'hello', 'world' ], 'hello world');
  // keeps whitespace with setting
  assertWords([ 'a', ' ', ' ', ' ', 'b' ], 'a   b', { includeWhitespace: true });
  // removes punctuation by default
  assertWords([ 'a', 'b' ], 'a .... b');
  // but keeps with setting
  assertWords([ 'a', '.', '.', '.', '.', 'b' ], 'a .... b', { includePunctuation: true });
  // does not split on katakana words
  assertWords([ '僕', 'の', '名', '前', 'は', 'マティアス' ], '僕の名前はマティアス');
  // does not split on numeric separators
  assertWords([ 'the', 'price', 'is', '3,500.50' ], 'the price is 3,500.50');

  assertWords([ 'http://www.google.com' ], 'http://www.google.com');
  assertWords([ 'https://www.google.com' ], 'https://www.google.com');
  assertWords([ 'http://www.google.com', 'abc' ], 'http://www.google.com abc');
  assertWords([ 'bengt@mail.se' ], 'bengt@mail.se');
  assertWords([ 'bengt@mail.se', 'abc' ], 'bengt@mail.se abc');
  assertWords([ '1+1*1/1⋉1=1' ], '1+1*1/1⋉1=1');
  assertWords([ '50-10' ], '50-10');
  assertWords([ 'jack-in-the-box' ], 'jack-in-the-box');
  assertWords([ 'n=13' ], 'n=13');
  assertWords([ 'n<13' ], 'n<13');
  assertWords([ '1<13' ], '1<13');
  assertWords([ 'n>13' ], 'n>13');
  assertWords([ '1>13' ], '1>13');
  assertWords([ 'n≥13' ], 'n≥13');
  assertWords([ '1≥13' ], '1≥13');
  assertWords([ 'n≤13' ], 'n≤13');
  assertWords([ '1≤13' ], '1≤13');
  assertWords([ '42.6±4.2' ], '42.6±4.2');

  // TINY-9654: Does not split on extend characters (ex: \u0300)
  assertWords([ 'a\u0300b' ], 'a\u0300b');
  assertWords([ 'a\u0300bc' ], 'a\u0300bc');
  assertWords([ 'ab\u0300c' ], 'ab\u0300c');
  assertWords([ 'a\u0300b', 'c' ], 'a\u0300b c');
  assertWords([ '\u0300b' ], '\u0300b');
  assertWords([ 'a', '\u0300b' ], 'a \u0300b');
  assertWords([ '\u0300' ], '\u0300');
  assertWords([ '\u0300' ], '\u0300 ');
  assertWords([ 'a\u0300' ], 'a\u0300');
  assertWords([ 'a\u0300' ], 'a\u0300 ');

  // TINY-9654: Does not split on format characters (ex: \ufeff) if they do not precede a word boundary
  // TINY-9654: Does not strip \ufeff characters (obsolete TINY-1166 fix removed)
  assertWords([ 'a\ufeffb' ], 'a\ufeffb');
  assertWords([ 'a\ufeffbc' ], 'a\ufeffbc');
  assertWords([ 'ab\ufeffc' ], 'ab\ufeffc');
  assertWords([ 'a\ufeffb', 'c' ], 'a\ufeffb c');
  assertWords([ '\ufeffb' ], '\ufeffb');
  assertWords([ 'a', '\ufeffb' ], 'a \ufeffb');

  // TINY-9654: Split on format characters if they precede a word boundary. Some format characters overlap with whitespace
  // characters (ex: \ufeff). Since whitespace characters are not extracted, if a whitespace-overlapping format character that
  // precedes a word boundary is not split on, whichever word it is a part of will not be added to the list of extracted words,
  // causing inaccuracies.
  assertWords([ ], '\ufeff');
  assertWords([ ], '\ufeff ');
  assertWords([ 'a' ], 'a\ufeff');
  assertWords([ 'a' ], 'a\ufeff ');
});
