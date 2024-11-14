import { Optional } from '@ephox/katamari';
import { Class, ContentEditable, SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as EditorFocus from '../focus/EditorFocus';

const removeFakeSelection = (editor: Editor) => {
  Optional.from(editor.selection.getNode()).each((elm) => {
    elm.removeAttribute('data-mce-selected');
  });
};

const setEditorCommandState = (editor: Editor, cmd: string, state: boolean) => {
  try {
    // execCommand needs a string for the value, so convert the boolean to a string
    // See: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#Parameters
    editor.getDoc().execCommand(cmd, false, String(state));
  } catch (ex) {
    // Ignore
  }
};

const setCommonEditorCommands = (editor: Editor, state: boolean): void => {
  setEditorCommandState(editor, 'StyleWithCSS', state);
  setEditorCommandState(editor, 'enableInlineTableEditing', state);
  setEditorCommandState(editor, 'enableObjectResizing', state);
};

const restoreFakeSelection = (editor: Editor) => {
  editor.selection.setRng(editor.selection.getRng());
};

// Not quite sugar Class.toggle, it's more of a Class.set
const toggleClass = (elm: SugarElement<Element>, cls: string, state: boolean) => {
  if (Class.has(elm, cls) && !state) {
    Class.remove(elm, cls);
  } else if (state) {
    Class.add(elm, cls);
  }
};

const disableEditor = (editor: Editor): void => {
  const body = SugarElement.fromDom(editor.getBody());
  toggleClass(body, 'mce-content-readonly', true);
  editor.selection.controlSelection.hideResizeRect();
  editor._selectionOverrides.hideFakeCaret();
  removeFakeSelection(editor);
};

const enableEditor = (editor: Editor): void => {
  const body = SugarElement.fromDom(editor.getBody());
  toggleClass(body, 'mce-content-readonly', false);

  if (editor.hasEditableRoot()) {
    ContentEditable.set(body, true);
  }
  setCommonEditorCommands(editor, false);
  if (EditorFocus.hasEditorOrUiFocus(editor)) {
    editor.focus();
  }
  restoreFakeSelection(editor);
  editor.nodeChanged();
};

export {
  enableEditor,
  disableEditor
};
