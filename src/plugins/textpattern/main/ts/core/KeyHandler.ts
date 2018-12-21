/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import { PatternSet, BlockPattern } from '../api/Pattern';
import { applyBlockPattern, applyInlinePatterns } from './PatternApplication';
import { findNestedInlinePatterns, findBlockPattern, textBefore } from './FindPatterns';
import { Option } from '@ephox/katamari';
import Zwsp from '../../../../../core/main/ts/text/Zwsp';

const handleEnter = (editor: Editor, patternSet: PatternSet): boolean => {
  const areas = findNestedInlinePatterns(editor.dom, patternSet.inlinePatterns, editor.selection.getRng(), false);
  const block: Option<BlockPattern> = findBlockPattern(editor.dom, patternSet.blockPatterns, editor.selection.getRng());
  if (editor.selection.isCollapsed() && (areas.length > 0 || block.isSome())) {
    editor.undoManager.add();
    editor.undoManager.extra(
      () => {
        editor.undoManager.transact(() => editor.execCommand('mceInsertNewLine'));
      },
      () => {
        // create a cursor position that we can move to avoid the inline formats
        editor.insertContent(Zwsp.ZWSP);
        applyInlinePatterns(editor, areas);
        block.each((pattern) => applyBlockPattern(editor, pattern));
        // find the node before the cursor position
        const range = editor.selection.getRng();
        const spot = textBefore(range.startContainer, range.startOffset, editor.dom.getParent(range.startContainer, editor.dom.isBlock));
        editor.execCommand('mceInsertNewLine');
        spot.each((s) => {
          if (Zwsp.isZwsp(s.node.data.charAt(s.offset - 1))) {
            s.node.deleteData(s.offset - 1, 1);
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