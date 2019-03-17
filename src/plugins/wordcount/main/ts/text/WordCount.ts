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

const getText = (node: Node, schema: Schema): string => {
  const blockElements: SchemaMap = schema.getBlockElements();
  const shortEndedElements: SchemaMap = schema.getShortEndedElements();
  const whiteSpaceElements = schema.getWhiteSpaceElements();
  const isSeparator = (node: Node) => (
    blockElements[node.nodeName] || shortEndedElements[node.nodeName] || whiteSpaceElements[node.nodeName]
  );

  let txt = '';
  const treeWalker = new TreeWalker(node, node);
  while ((node = treeWalker.next())) {
    if (node.nodeType === 3) {
      txt += (node as CharacterData).data;
    } else if (txt.length !== 0 && isSeparator(node)) {
      txt += ' ';
    }
  }

  return txt;
};

const getTextContent = (editor: Editor): string => {
  return editor.removed ? '' : getText(editor.getBody(), editor.schema);
};

export interface WordCount {
  words: number;
  characters: number;
  charactersNoSpace: number;
}
const getCount = (textContent: string): WordCount => {
  return {
    words: Words.getWords(textContent.split(''), Fun.identity).length,
    characters: textContent.length,
    charactersNoSpace: textContent.replace(/\s/g, '').length
  };
};

const getEditorWordcount = (editor: Editor) => {
  return getCount(getTextContent(editor));
};

const getSelectionWordcount = (editor: Editor) => {
  const selectedText = getText(editor.selection.getRng().cloneContents(), editor.schema);
  return editor.selection.isCollapsed() ? getCount('') : getCount(selectedText);
};

export {
  getText,
  getEditorWordcount,
  getSelectionWordcount
};