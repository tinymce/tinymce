import { Arr, Type } from '@ephox/katamari';
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

const rollbackChange = (editor: Editor): void => {
  const undoLevel = editor.undoManager.add();
  if (Type.isNonNullable(undoLevel)) {
    editor.undoManager.undo();
    editor.undoManager.reset();
  }
};

const hasContentMutations = (mutations: MutationRecord[]): boolean =>
  Arr.exists(mutations, (mutation) =>
    mutation.type === 'characterData' || mutation.type === 'childList'
  );

const registerReadOnlyInputBlockers = (editor: Editor): void => {
  const handleMutations = (mutations: MutationRecord[]) => {
    if (isReadOnly(editor) && hasContentMutations(mutations)) {
      rollbackChange(editor);
    }
  };

  // Set up mutation observer to detect and revert unintended changes
  const observer = new MutationObserver(handleMutations);

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

  editor.on('compositionstart', () => {
    if (isReadOnly(editor)) {
      observer.observe(editor.getBody(), {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  });

  editor.on('compositionend', () => {
    if (isReadOnly(editor)) {
      const records = observer.takeRecords();
      handleMutations(records);
    }
    observer.disconnect();
  });
};

export {
  isReadOnly,
  toggleReadOnly,
  registerReadOnlyInputBlockers
};
