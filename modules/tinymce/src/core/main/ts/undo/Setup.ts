/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from '../api/Editor';
import Levels from './Levels';
import { UndoManager, Locks, UndoLevel } from './UndoManagerTypes';
import { endTyping, setTyping } from './TypingState';

export const registerEvents = (editor: Editor, undoManager: UndoManager, locks: Locks) => {
  const isFirstTypedCharacter = Cell(false);

  const addNonTypingUndoLevel = (e?) => {
    setTyping(undoManager, false, locks);
    undoManager.add({} as UndoLevel, e);
  };

  // Add initial undo level when the editor is initialized
  editor.on('init', () => {
    undoManager.add();
  });

  // Get position before an execCommand is processed
  editor.on('BeforeExecCommand', (e) => {
    const cmd = e.command;

    if (cmd !== 'Undo' && cmd !== 'Redo' && cmd !== 'mceRepaint') {
      endTyping(undoManager, locks);
      undoManager.beforeChange();
    }
  });

  // Add undo level after an execCommand call was made
  editor.on('ExecCommand', (e) => {
    const cmd = e.command;

    if (cmd !== 'Undo' && cmd !== 'Redo' && cmd !== 'mceRepaint') {
      addNonTypingUndoLevel(e);
    }
  });

  editor.on('ObjectResizeStart cut', () => {
    undoManager.beforeChange();
  });

  editor.on('SaveContent ObjectResized blur', addNonTypingUndoLevel);
  editor.on('dragend', addNonTypingUndoLevel);

  editor.on('keyup', (e) => {
    const keyCode = e.keyCode;

    // If key is prevented then don't add undo level
    // This would happen on keyboard shortcuts for example
    if (e.isDefaultPrevented()) {
      return;
    }

    if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode === 45 || e.ctrlKey) {
      addNonTypingUndoLevel();
      editor.nodeChanged();
    }

    if (keyCode === 46 || keyCode === 8) {
      editor.nodeChanged();
    }

    // Fire a TypingUndo/Change event on the first character entered
    if (isFirstTypedCharacter.get() && undoManager.typing && Levels.isEq(Levels.createFromEditor(editor), undoManager.data[0]) === false) {
      if (editor.isDirty() === false) {
        editor.setDirty(true);
        editor.fire('change', { level: undoManager.data[0], lastLevel: null });
      }

      editor.fire('TypingUndo');
      isFirstTypedCharacter.set(false);
      editor.nodeChanged();
    }
  });

  editor.on('keydown', (e) => {
    const keyCode = e.keyCode;

    // If key is prevented then don't add undo level
    // This would happen on keyboard shortcuts for example
    if (e.isDefaultPrevented()) {
      return;
    }

    // Is character position keys left,right,up,down,home,end,pgdown,pgup,enter
    if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode === 45) {
      if (undoManager.typing) {
        addNonTypingUndoLevel(e);
      }

      return;
    }

    // If key isn't Ctrl+Alt/AltGr
    const modKey = (e.ctrlKey && !e.altKey) || e.metaKey;
    if ((keyCode < 16 || keyCode > 20) && keyCode !== 224 && keyCode !== 91 && !undoManager.typing && !modKey) {
      undoManager.beforeChange();
      setTyping(undoManager, true, locks);
      undoManager.add({} as UndoLevel, e);
      isFirstTypedCharacter.set(true);
    }
  });

  editor.on('mousedown', (e) => {
    if (undoManager.typing) {
      addNonTypingUndoLevel(e);
    }
  });

  // Special inputType, currently only Chrome implements this: https://www.w3.org/TR/input-events-2/#x5.1.2-attributes
  const isInsertReplacementText = (event) => event.inputType === 'insertReplacementText';
  // Safari just shows inputType `insertText` but with data set to null so we can use that
  const isInsertTextDataNull = (event) => event.inputType === 'insertText' && event.data === null;

  // For detecting when user has replaced text using the browser built-in spell checker
  editor.on('input', (e) => {
    if (e.inputType && (isInsertReplacementText(e) || isInsertTextDataNull(e))) {
      addNonTypingUndoLevel(e);
    }
  });

  editor.on('AddUndo Undo Redo ClearUndos', (e) => {
    if (!e.isDefaultPrevented()) {
      editor.nodeChanged();
    }
  });
};

export const addKeyboardShortcuts = (editor: Editor) => {
  editor.addShortcut('meta+z', '', 'Undo');
  editor.addShortcut('meta+y,meta+shift+z', '', 'Redo');
};
