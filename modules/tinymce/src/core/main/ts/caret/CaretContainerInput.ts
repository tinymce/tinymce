/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Event } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { Element, SelectorFind } from '@ephox/sugar';
import * as CaretContainer from './CaretContainer';
import Editor from '../api/Editor';

/**
 * This module shows the invisible block that the caret is currently in when contents is added to that block.
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