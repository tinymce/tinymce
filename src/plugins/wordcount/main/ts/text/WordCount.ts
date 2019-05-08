/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { CharacterData, Node } from '@ephox/dom-globals';
import { Words } from '@ephox/polaris';
import { Fun } from '@ephox/katamari';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import Schema, { SchemaMap } from 'tinymce/core/api/html/Schema';

export interface WordCount {
  words: number;
  characters: number;
  charactersNoSpace: number;
}

const getText = (node: Node, schema: Schema): string[] => {
  const blockElements: SchemaMap = schema.getBlockElements();
  const shortEndedElements: SchemaMap = schema.getShortEndedElements();

  const isNewline = (node: Node) => (
    blockElements[node.nodeName] || shortEndedElements[node.nodeName]
  );

  const textBlocks: string[] = [];
  let txt = '';
  const treeWalker = new TreeWalker(node, node);

  while ((node = treeWalker.next())) {
    if (node.nodeType === 3) {
      txt += (node as CharacterData).data;
    } else if (isNewline(node) && txt.length) {
      textBlocks.push(txt);
      txt = '';
    }
  }

  if (txt.length) {
    textBlocks.push(txt);
  }

  return textBlocks;
};

const getCharacterCount = (str: string): number => {
  return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '_').length;
};

const getCount = (textBlocks: string[]): WordCount => {
  const textWithoutNewline = textBlocks.join('');
  const textWithNewline = textBlocks.join('\n');

  return {
    words: Words.getWords(textWithNewline.split(''), Fun.identity).length,
    characters: getCharacterCount(textWithoutNewline),
    charactersNoSpace: getCharacterCount(textWithoutNewline.replace(/\s/g, ''))
  };
};

const getEditorCount = (editor: Editor) => {
  return getCount(getText(editor.getBody(), editor.schema));
};

const getSelectionCount = (editor: Editor) => {
  const selectedText = getText(editor.selection.getRng().cloneContents(), editor.schema);
  return editor.selection.isCollapsed() ? getCount(['']) : getCount(selectedText);
};

export {
  getText,
  getEditorCount,
  getSelectionCount
};