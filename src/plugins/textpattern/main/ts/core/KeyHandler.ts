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
import { PatternSet } from '../api/Pattern';
import { applyBlockPatterns, applyNestedInlinePatterns } from './ApplyPatterns';
import { textBefore } from './TextSearch';
import { cleanEmptyNodes } from './Utils';

const handleEnter = (editor: Editor, patternSet: PatternSet): boolean => {
  if (editor.selection.isCollapsed()) {
    editor.undoManager.add();
    editor.undoManager.extra(
      () => {
        editor.execCommand('mceInsertNewLine');
      },
      () => {
        // create a cursor position that we can move to avoid the inline formats
        editor.insertContent(Unicode.zeroWidth());
        applyNestedInlinePatterns(editor, patternSet.inlinePatterns);
        applyBlockPatterns(editor, patternSet.blockPatterns);
        // find the spot before the cursor position
        const range = editor.selection.getRng();
        const spot = textBefore(range.startContainer, range.startOffset, editor.dom.getRoot());
        editor.execCommand('mceInsertNewLine');
        // clean up the cursor position we used to preserve the format
        spot.each((s) => {
          if (s.element.data.charAt(s.offset - 1) === Unicode.zeroWidth()) {
            s.element.deleteData(s.offset - 1, 1);
            cleanEmptyNodes(editor.dom, s.element.parentNode, (e: Node) => e === editor.dom.getRoot());
          }
        });
      }
    );
    return true;
  }
  return false;
};

const handleInlineKey = (editor: Editor, patternSet: PatternSet): void => {
  editor.undoManager.transact(() => {
    applyNestedInlinePatterns(editor, patternSet.inlinePatterns);
  });
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