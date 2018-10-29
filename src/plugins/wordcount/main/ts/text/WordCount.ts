/**
 * WordCount.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { CharacterData, Node } from '@ephox/dom-globals';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import { Editor } from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Schema, { SchemaMap } from 'tinymce/core/api/html/Schema';
import * as WordGetter from './WordGetter';

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

const innerText = (node: Node, schema: Schema): string => {
  return Env.ie ? getText(node, schema) : (node as any).innerText;
};

const getTextContent = (editor: Editor): string => {
  return editor.removed ? '' : innerText(editor.getBody(), editor.schema);
};

const getCount = (textContent: string) => {
  return {
    words: WordGetter.getWords(textContent).length,
    characters: textContent.length,
    charactersNoSpace: textContent.replace(/\s/g, '').length
  };
};

const getEditorWordcount = (editor: Editor) => {
  return getCount(getTextContent(editor));
};

const getSelectionWordcount = (editor: Editor) => {
  const selectedText = getText(editor.selection.getRng().cloneContents(), editor.schema);
  console.log(selectedText);
  return editor.selection.isCollapsed() ? getCount('') : getCount(selectedText);
};

export {
  getText,
  getEditorWordcount,
  getSelectionWordcount
};