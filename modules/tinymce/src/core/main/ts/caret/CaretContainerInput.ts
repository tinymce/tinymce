/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as CaretContainer from './CaretContainer';

/**
 * This module shows the invisible block that the caret is currently in when contents is added to that block.
 */

const findBlockCaretContainer = (editor: Editor) => {
  return SelectorFind.descendant(SugarElement.fromDom(editor.getBody()), '*[data-mce-caret]').fold(Fun.constant(null), (elm) => {
    return elm.dom;
  });
};

const removeIeControlRect = (editor: Editor) => {
  editor.selection.setRng(editor.selection.getRng());
};

const showBlockCaretContainer = (editor: Editor, blockCaretContainer: HTMLElement) => {
  if (blockCaretContainer.hasAttribute('data-mce-caret')) {
    CaretContainer.showCaretContainerBlock(blockCaretContainer);
    removeIeControlRect(editor);
    editor.selection.scrollIntoView(blockCaretContainer);
  }
};

const handleBlockContainer = (editor: Editor, e: Event) => {
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

const setup = (editor: Editor) => {
  editor.on('keyup compositionstart', Fun.curry(handleBlockContainer, editor));
};

export {
  setup
};
