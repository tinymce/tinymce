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
  // Block all input events in readonly mode
  editor.on('beforeinput compositionstart compositionupdate compositionend input paste cut dragend dragover draggesture dragdrop drop drag', (e) => {
    if (isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  editor.on('BeforeExecCommand', (e) => {
    if ((e.command === 'Undo' || e.command === 'Redo') && isReadOnly(editor)) {
      e.preventDefault();
    }
  });

  // Prevent undo level additions during composition
  editor.on('input compositionend', (e) => {
    if (isReadOnly(editor)) {
      // Skip undo level addition during composition
      if (!e.isComposing) {
        const undoLevel = editor.undoManager.add();
        if (Type.isNonNullable(undoLevel)) {
          editor.undoManager.undo();
        }
      }
    }
  });

  // Set up mutation observer to detect and revert unintended changes
  const observer = new MutationObserver((mutations) => {
    if (isReadOnly(editor)) {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          // Revert the changes by restoring the previous content
          const undoLevel = editor.undoManager.add();
          if (Type.isNonNullable(undoLevel)) {
            editor.undoManager.undo();
          }
        }
      });
    }
  });

  editor.on('init', () => {
    observer.observe(editor.getBody(), {
      characterData: true,
      childList: true,
      subtree: true
    });
  });

  editor.on('remove', () => {
    observer.disconnect();
  });
};

export {
  isReadOnly,
  toggleReadOnly,
  registerReadOnlyInputBlockers
};
