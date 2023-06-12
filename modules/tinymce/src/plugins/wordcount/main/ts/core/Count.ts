import { Fun } from '@ephox/katamari';
import { Words } from '@ephox/polaris';

import Schema from 'tinymce/core/api/html/Schema';

import { getText } from './GetText';

export type Counter = (node: Node, schema: Schema) => number;

const removeZwsp = (text: string) =>
  text.replace(/\u200B/g, '');

const strLen = (str: string): number =>
  str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;

const countWords: Counter = (node: Node, schema: Schema): number => {
  // TODO - TINY-9708: See if TINY-7484 fix can be replaced by adding \u200B to the "format" character class as per Unicode standard
  // TINY-7484: The grapheme word boundary logic used by Polaris states a ZWSP (\u200B) should be treated as
  // a word boundary, however word counting normally does not consider it as anything so we strip it out.
  const text = removeZwsp(getText(node, schema).join('\n'));
  return Words.getWords(text.split(''), Fun.identity).length;
};

const countCharacters: Counter = (node: Node, schema: Schema): number => {
  const text = getText(node, schema).join('');
  return strLen(text);
};

const countCharactersWithoutSpaces: Counter = (node: Node, schema: Schema): number => {
  const text = getText(node, schema).join('').replace(/\s/g, '');
  return strLen(text);
};

export {
  countWords,
  countCharacters,
  countCharactersWithoutSpaces
};
