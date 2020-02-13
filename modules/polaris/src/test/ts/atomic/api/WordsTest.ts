import { UnitTest, assert } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { getWords, WordOptions } from 'ephox/polaris/words/Words';

UnitTest.test('api.Words.words', () => {
  interface Char {
    char: string;
  }

  const parseString = (str: string): Char[] => {
    return Arr.map(str.split(''), (char) => {
      return { char };
    });
  };

  // In order to simplify the assertions
  const simplifySets = (charSets: Char[][]): string[] => {
    return Arr.map(charSets, (set) => {
      return Arr.map(set, (char) => char.char).join('');
    });
  };

  const assertWords = (expected: string[], input: string, options?: WordOptions) => {
    const chars: Char[] = parseString(input);
    const wordSets: Char[][] = getWords(chars, (char) => char.char, options);
    const actual = simplifySets(wordSets);

    assert.eq(expected, actual);
  };

  // splits words on whitespace
  assertWords(['hello', 'world'], 'hello world');
  // keeps whitespace with setting
  assertWords(['a', ' ', ' ', ' ', 'b'], 'a   b', { includeWhitespace: true });
  // removes punctuation by default
  assertWords(['a', 'b'], 'a .... b');
  // but keeps with setting
  assertWords(['a', '.', '.', '.', '.', 'b'], 'a .... b', { includePunctuation: true });
  // does not split on katakana words
  assertWords(['僕', 'の', '名', '前', 'は', 'マティアス'], '僕の名前はマティアス');
  // does not split on numeric separators
  assertWords(['the', 'price', 'is', '3,500.50'], 'the price is 3,500.50');

  assertWords(['http://www.google.com'], 'http://www.google.com');
  assertWords(['https://www.google.com'], 'https://www.google.com');
  assertWords(['http://www.google.com', 'abc'], 'http://www.google.com abc');
  assertWords(['bengt@mail.se'], 'bengt@mail.se');
  assertWords(['bengt@mail.se', 'abc'], 'bengt@mail.se abc');
  assertWords(['1+1*1/1⋉1=1'], '1+1*1/1⋉1=1');
  assertWords(['50-10'], '50-10');
  assertWords(['jack-in-the-box'], 'jack-in-the-box');
  assertWords(['n=13'], 'n=13');
  assertWords(['n<13'], 'n<13');
  assertWords(['1<13'], '1<13');
  assertWords(['n>13'], 'n>13');
  assertWords(['1>13'], '1>13');
  assertWords(['n≥13'], 'n≥13');
  assertWords(['1≥13'], '1≥13');
  assertWords(['n≤13'], 'n≤13');
  assertWords(['1≤13'], '1≤13');
  assertWords(['42.6±4.2'], '42.6±4.2');
  assertWords(['ab'], 'a\ufeffb');
});
