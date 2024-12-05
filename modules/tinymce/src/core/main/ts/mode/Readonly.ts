import { Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as ModeUtils from '../util/ModeUtils';

const setContentEditable = (elm: SugarElement<HTMLElement>, state: boolean) => {
  elm.dom.contentEditable = state ? 'true' : 'false';
};

const toggleReadOnly = (editor: Editor, state: boolean): void => {
  const body = SugarElement.fromDom(editor.getBody());

  if (state) {
    editor.readonly = true;
    if (editor.hasEditableRoot()) {
      setContentEditable(body, true);
    }
    ModeUtils.disableEditor(editor);
  } else {
    editor.readonly = false;
    ModeUtils.enableEditor(editor);
  }
};

const isReadOnly = (editor: Editor): boolean => editor.readonly;

const registerReadOnlyInputBlockers = (editor: Editor): void => {
  editor.on('beforeinput paste cut dragend dragover draggesture dragdrop drop drag', (e) => {
    if (isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  editor.on('BeforeExecCommand', (e) => {
    if ((e.command === 'Undo' || e.command === 'Redo') && isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  editor.on('input', (e) => {
    if (!e.isComposing && isReadOnly(editor)) {
      const undoLevel = editor.undoManager.add();
      if (Type.isNonNullable(undoLevel)) {
        editor.undoManager.undo();
      }
    }
  });

  editor.on('compositionend', () => {
    if (isReadOnly(editor)) {
      const undoLevel = editor.undoManager.add();
      if (Type.isNonNullable(undoLevel)) {
        editor.undoManager.undo();
      }
    }
  });
};

export {
  isReadOnly,
  toggleReadOnly,
  registerReadOnlyInputBlockers
};
