/**
 * KeyHandler.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import VK from 'tinymce/core/api/util/VK';
import Formatter from './Formatter';

function handleEnter(editor, patterns) {
  let wrappedTextNode, rng;

  wrappedTextNode = Formatter.applyInlineFormatEnter(editor, patterns);
  if (wrappedTextNode) {
    rng = editor.dom.createRng();
    rng.setStart(wrappedTextNode, wrappedTextNode.data.length);
    rng.setEnd(wrappedTextNode, wrappedTextNode.data.length);
    editor.selection.setRng(rng);
  }

  Formatter.applyBlockFormat(editor, patterns);
}

function handleInlineKey(editor, patterns) {
  let wrappedTextNode, lastChar, lastCharNode, rng, dom;

  wrappedTextNode = Formatter.applyInlineFormatSpace(editor, patterns);
  if (wrappedTextNode) {
    dom = editor.dom;
    lastChar = wrappedTextNode.data.slice(-1);

    // Move space after the newly formatted node
    if (/[\u00a0 ]/.test(lastChar)) {
      wrappedTextNode.deleteData(wrappedTextNode.data.length - 1, 1);
      lastCharNode = dom.doc.createTextNode(lastChar);

      dom.insertAfter(lastCharNode, wrappedTextNode.parentNode);

      rng = dom.createRng();
      rng.setStart(lastCharNode, 1);
      rng.setEnd(lastCharNode, 1);
      editor.selection.setRng(rng);
    }
  }
}

const checkKeyEvent = function (codes, event, predicate) {
  for (let i = 0; i < codes.length; i++) {
    if (predicate(codes[i], event)) {
      return true;
    }
  }
};

const checkKeyCode = function (codes, event) {
  return checkKeyEvent(codes, event, function (code, event) {
    return code === event.keyCode && VK.modifierPressed(event) === false;
  });
};

const checkCharCode = function (chars, event) {
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