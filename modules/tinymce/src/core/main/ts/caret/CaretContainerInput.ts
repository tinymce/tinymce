import { Fun } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as CaretContainer from './CaretContainer';

/**
 * This module shows the invisible block that the caret is currently in when contents is added to that block.
 */

const findBlockCaretContainer = (editor: Editor): HTMLElement | null =>
  SelectorFind.descendant<HTMLElement>(SugarElement.fromDom(editor.getBody()), '*[data-mce-caret]')
    .map((elm) => elm.dom)
    .getOrNull();

const showBlockCaretContainer = (editor: Editor, blockCaretContainer: HTMLElement): void => {
  if (blockCaretContainer.hasAttribute('data-mce-caret')) {
    CaretContainer.showCaretContainerBlock(blockCaretContainer);
    editor.selection.setRng(editor.selection.getRng()); // Clears the fake caret state
    editor.selection.scrollIntoView(blockCaretContainer);
  }
};

const handleBlockContainer = (editor: Editor, e: Event): void => {
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

const setup = (editor: Editor): void => {
  editor.on('keyup compositionstart', Fun.curry(handleBlockContainer, editor));
};

export {
  setup
};
