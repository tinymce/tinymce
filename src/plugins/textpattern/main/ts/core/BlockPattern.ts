/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';
import Editor from 'tinymce/core/api/Editor';
import { BlockPattern } from '../api/Pattern';
import * as TextSearch from '../text/TextSearch';
import { TextWalker } from '../text/TextWalker';
import * as Utils from './Utils';

const stripPattern = (dom: DOMUtils, block: Node, pattern: BlockPattern) => {
  // The pattern could be across fragmented text nodes, so we need to find the end
  // of the pattern and then remove all elements between the start/end range
  const firstTextNode = TextWalker(block, block).next();
  firstTextNode.each((node) => {
    TextSearch.scanRight(node, pattern.start.length, block).each((end) => {
      const rng = dom.createRng();
      rng.setStart(node, 0);
      rng.setEnd(end.element, end.offset);

      Utils.deleteRng(dom, rng, (e: Node) => e === block);
    });
  });
};

const applyPattern = (editor: Editor, block: Node, pattern: BlockPattern): boolean => {
  // add a marker to store the cursor position
  const cursor = editor.selection.getBookmark();

  if (pattern.type === 'block-format') {
    if (Utils.isBlockFormatName(pattern.format, editor.formatter)) {
      editor.undoManager.transact(() => {
        stripPattern(editor.dom, block, pattern);
        editor.formatter.apply(pattern.format);
      });
    }
  } else if (pattern.type === 'block-command') {
    editor.undoManager.transact(() => {
      stripPattern(editor.dom, block, pattern);
      editor.execCommand(pattern.cmd, false, pattern.value);
    });
  }

  // restore the selection
  editor.selection.moveToBookmark(cursor);

  return true;
};

const applyPatterns = (editor: Editor, patterns: BlockPattern[]): boolean => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const block = dom.getParent(rng.startContainer, dom.isBlock);

  if (!(dom.is(block, 'p') && Utils.isElement(block))) {
    return false;
  }

  // Get the block text
  const blockText = block.textContent;

  // Find the pattern
  const matchedPattern = Utils.findPattern(patterns, blockText);
  return matchedPattern.map((pattern) => {
    if (Tools.trim(blockText).length === pattern.start.length) {
      return false;
    }

    // Apply the pattern
    return applyPattern(editor, block, pattern);
  }).getOr(false);
};

export { applyPatterns };