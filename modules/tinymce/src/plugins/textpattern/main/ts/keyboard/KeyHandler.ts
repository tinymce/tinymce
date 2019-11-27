/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import { Unicode } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import * as BlockPattern from '../core/BlockPattern';
import * as InlinePattern from '../core/InlinePattern';
import { PatternSet } from '../core/PatternTypes';
import { textBefore } from '../text/TextSearch';
import { cleanEmptyNodes } from '../utils/Utils';

const handleEnter = (editor: Editor, patternSet: PatternSet): boolean => {
  // Skip checking when the selection isn't collapsed
  if (!editor.selection.isCollapsed()) {
    return false;
  }

  // Find any matches
  const inlineMatches = InlinePattern.findPatterns(editor, patternSet.inlinePatterns, false);
  const blockMatches = BlockPattern.findPatterns(editor, patternSet.blockPatterns);
  if (blockMatches.length > 0 || inlineMatches.length > 0) {
    editor.undoManager.add();
    editor.undoManager.extra(
      () => {
        editor.execCommand('mceInsertNewLine');
      },
      () => {
        // create a cursor position that we can move to avoid the inline formats
        editor.insertContent(Unicode.zeroWidth);
        InlinePattern.applyMatches(editor, inlineMatches);
        BlockPattern.applyMatches(editor, blockMatches);
        // find the spot before the cursor position
        const range = editor.selection.getRng();
        const spot = textBefore(range.startContainer, range.startOffset, editor.dom.getRoot());
        editor.execCommand('mceInsertNewLine');
        // clean up the cursor position we used to preserve the format
        spot.each((s) => {
          const node = s.container;
          if (node.data.charAt(s.offset - 1) === Unicode.zeroWidth) {
            node.deleteData(s.offset - 1, 1);
            cleanEmptyNodes(editor.dom, node.parentNode, (e: Node) => e === editor.dom.getRoot());
          }
        });
      }
    );
    return true;
  }
  return false;
};

const handleInlineKey = (editor: Editor, patternSet: PatternSet): void => {
  const inlineMatches = InlinePattern.findPatterns(editor, patternSet.inlinePatterns, true);
  if (inlineMatches.length > 0) {
    editor.undoManager.transact(() => {
      InlinePattern.applyMatches(editor, inlineMatches);
    });
  }
};

const checkKeyEvent = (codes, event, predicate) => {
  for (let i = 0; i < codes.length; i++) {
    if (predicate(codes[i], event)) {
      return true;
    }
  }
};

const checkKeyCode = (codes, event) => {
  return checkKeyEvent(codes, event, function (code, event) {
    return code === event.keyCode && VK.modifierPressed(event) === false;
  });
};

const checkCharCode = (chars, event) => {
  return checkKeyEvent(chars, event, function (chr, event) {
    return chr.charCodeAt(0) === event.charCode;
  });
};

export default {
  handleEnter,
  handleInlineKey,
  checkCharCode,
  checkKeyCode
};
