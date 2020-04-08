/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Words } from '@ephox/polaris';
import Schema from 'tinymce/core/api/html/Schema';
import { getText } from './GetText';

export type Counter = (node: Node, schema: Schema) => number;

const strLen = (str: string): number => str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;

const countWords: Counter = (node: Node, schema: Schema) => {
  const text = getText(node, schema).join('\n');
  return Words.getWords(text.split(''), Fun.identity).length;
};

const countCharacters: Counter = (node: Node, schema: Schema) => {
  const text = getText(node, schema).join('');
  return strLen(text);
};

const countCharactersWithoutSpaces: Counter = (node: Node, schema: Schema) => {
  const text = getText(node, schema).join('').replace(/\s/g, '');
  return strLen(text);
};

export {
  countWords,
  countCharacters,
  countCharactersWithoutSpaces
};
