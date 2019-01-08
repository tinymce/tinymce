/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import { PatternSet } from '../api/Pattern';
import { findBlockPattern, findNestedInlinePatterns, textBefore } from './FindPatterns';
import { applyBlockPattern, applyInlinePatterns } from './PatternApplication';
import { Unicode } from '@ephox/katamari';

const handleEnter = (editor: Editor, patternSet: PatternSet): boolean => {
  const inlineAreas = findNestedInlinePatterns(editor.dom, patternSet.inlinePatterns, editor.selection.getRng(), false);
  const blockArea = findBlockPattern(editor.dom, patternSet.blockPatterns, editor.selection.getRng());
  if (editor.selection.isCollapsed() && (inlineAreas.length > 0 || blockArea.isSome())) {
    editor.undoManager.add();
    editor.undoManager.extra(
      () => {
        editor.execCommand('mceInsertNewLine');
      },
      () => {
        // create a cursor position that we can move to avoid the inline formats
        editor.insertContent(Unicode.zeroWidth());
        applyInlinePatterns(editor, inlineAreas);
        blockArea.each((pattern) => applyBlockPattern(editor, pattern));
        // find the spot before the cursor position
        const range = editor.selection.getRng();
        const block = editor.dom.getParent(range.startContainer, editor.dom.isBlock);
        const spot = textBefore(range.startContainer, range.startOffset, block);
        editor.execCommand('mceInsertNewLine');
        // clean up the cursor position we used to preserve the format
        spot.each((s) => {
          if (s.node.data.charAt(s.offset - 1) === Unicode.zeroWidth()) {
            s.node.deleteData(s.offset - 1, 1);
            if (editor.dom.isEmpty(s.node.parentNode)) {
              editor.dom.remove(s.node.parentNode);
            }
          }
        });
      }
    );
    return true;
  }
  return false;
};

const handleInlineKey = (editor: Editor, patternSet: PatternSet): void => {
  const areas = findNestedInlinePatterns(editor.dom, patternSet.inlinePatterns, editor.selection.getRng(), true);
  if (areas.length > 0) {
    editor.undoManager.transact(() => {
      applyInlinePatterns(editor, areas);
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