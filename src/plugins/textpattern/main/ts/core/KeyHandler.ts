/**
 * KeyHandler.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import { PatternSet } from '../api/Pattern';
import { applyBlockPattern, applyInlinePatternEnter, applyInlinePatternSpace, applyReplacementPattern } from './PatternApplication';

const handleEnter = (editor: Editor, patternSet: PatternSet): void => {
  applyReplacementPattern(editor, patternSet.replacementPatterns);
  applyInlinePatternEnter(editor, patternSet.inlinePatterns);
  applyBlockPattern(editor, patternSet.blockPatterns);
};

const handleInlineKey = (editor: Editor, patternSet: PatternSet): void => {
  applyReplacementPattern(editor, patternSet.replacementPatterns);
  applyInlinePatternSpace(editor, patternSet.inlinePatterns);
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