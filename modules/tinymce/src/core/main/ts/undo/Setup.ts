import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import Env from '../api/Env';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as Levels from './Levels';
import { endTyping, setTyping } from './TypingState';
import { Locks, UndoLevel, UndoManager } from './UndoManagerTypes';

// Avoid adding non-typing undo levels for commands that could cause duplicate undo levels to be created
// or do not alter the editor content or selection in any way
const shouldIgnoreCommand = (cmd: string): boolean => {
  switch (cmd.toLowerCase()) {
    case 'undo':
    case 'redo':
    case 'mcefocus':
      return true;
    default:
      return false;
  }
};

export const registerEvents = (editor: Editor, undoManager: UndoManager, locks: Locks): void => {
  const isFirstTypedCharacter = Cell(false);

  const addNonTypingUndoLevel = (e?: EditorEvent<any>) => {
    setTyping(undoManager, false, locks);
    undoManager.add({}, e);
  };

  // Add initial undo level when the editor is initialized
  editor.on('init', () => {
    undoManager.add();
  });

  // Get position before an execCommand is processed
  editor.on('BeforeExecCommand', (e) => {
    const cmd = e.command;

    if (!shouldIgnoreCommand(cmd)) {
      endTyping(undoManager, locks);
      undoManager.beforeChange();
    }
  });

  // Add undo level after an execCommand call was made
  editor.on('ExecCommand', (e) => {
    const cmd = e.command;

    if (!shouldIgnoreCommand(cmd)) {
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

    const isMeta = Env.os.isMacOS() && e.key === 'Meta';

    if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode === 45 || e.ctrlKey || isMeta) {
      addNonTypingUndoLevel();
      editor.nodeChanged();
    }

    if (keyCode === 46 || keyCode === 8) {
      editor.nodeChanged();
    }

    // Fire a TypingUndo event on the first character entered
    if (isFirstTypedCharacter.get() && undoManager.typing && !Levels.isEq(Levels.createFromEditor(editor), undoManager.data[0])) {
      if (!editor.isDirty()) {
        editor.setDirty(true);
      }

      editor.dispatch('TypingUndo');
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
      return;
    }

    const hasOnlyMetaOrCtrlModifier = Env.os.isMacOS() ? e.metaKey : e.ctrlKey && !e.altKey;
    if (hasOnlyMetaOrCtrlModifier) {
      undoManager.beforeChange();
    }
  });

  editor.on('mousedown', (e) => {
    if (undoManager.typing) {
      addNonTypingUndoLevel(e);
    }
  });

  // Special inputType, currently only Chrome implements this: https://www.w3.org/TR/input-events-2/#x5.1.2-attributes
  const isInsertReplacementText = (event: EditorEvent<InputEvent>) => event.inputType === 'insertReplacementText';
  // Safari just shows inputType `insertText` but with data set to null so we can use that
  const isInsertTextDataNull = (event: EditorEvent<InputEvent>) => event.inputType === 'insertText' && event.data === null;
  const isInsertFromPasteOrDrop = (event: EditorEvent<InputEvent>) => event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop';

  // For detecting when user has replaced text using the browser built-in spell checker or paste/drop events
  editor.on('input', (e) => {
    if (e.inputType && (isInsertReplacementText(e) || isInsertTextDataNull(e) || isInsertFromPasteOrDrop(e))) {
      addNonTypingUndoLevel(e);
    }
  });

  editor.on('AddUndo Undo Redo ClearUndos', (e) => {
    if (!e.isDefaultPrevented()) {
      editor.nodeChanged();
    }
  });
};

export const addKeyboardShortcuts = (editor: Editor): void => {
  editor.addShortcut('meta+z', '', 'Undo');
  editor.addShortcut('meta+y,meta+shift+z', '', 'Redo');
};
