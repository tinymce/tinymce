/**
 * CaretContainerInput.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Element, SelectorFind } from '@ephox/sugar';
import * as CaretContainer from './CaretContainer';
import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement, Event } from '@ephox/dom-globals';

/**
 * This module shows the invisble block that the caret is currently in when contents is added to that block.
 */

const findBlockCaretContainer = function (editor: Editor) {
  return SelectorFind.descendant(Element.fromDom(editor.getBody()), '*[data-mce-caret]').fold(Fun.constant(null), function (elm) {
    return elm.dom();
  });
};

const removeIeControlRect = function (editor: Editor) {
  editor.selection.setRng(editor.selection.getRng());
};

const showBlockCaretContainer = function (editor: Editor, blockCaretContainer: HTMLElement) {
  if (blockCaretContainer.hasAttribute('data-mce-caret')) {
    CaretContainer.showCaretContainerBlock(blockCaretContainer);
    removeIeControlRect(editor);
    editor.selection.scrollIntoView(blockCaretContainer);
  }
};

const handleBlockContainer = function (editor: Editor, e: Event) {
  const blockCaretContainer = findBlockCaretContainer(editor);

  if (!blockCaretContainer) {
    return;
  }

  if (e.type === 'compositionstart') {
    e.preventDefault();
    e.stopPropagation();
    showBlockCaretContainer(editor, blockCaretContainer);
    return;
  }

  if (CaretContainer.hasContent(blockCaretContainer)) {
    showBlockCaretContainer(editor, blockCaretContainer);
    editor.undoManager.add();
  }
};

const setup = function (editor: Editor) {
  editor.on('keyup compositionstart', Fun.curry(handleBlockContainer, editor));
};

export default {
  setup
};