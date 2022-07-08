import Editor from '../api/Editor';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import * as GetBookmark from '../bookmark/GetBookmark';
import * as Levels from './Levels';
import { isUnlocked } from './Locks';
import { endTyping, setTyping } from './TypingState';
import { Index, Locks, UndoBookmark, UndoLevel, UndoManager } from './UndoManagerTypes';

export const beforeChange = (editor: Editor, locks: Locks, beforeBookmark: UndoBookmark): void => {
  if (isUnlocked(locks)) {
    beforeBookmark.set(GetBookmark.getUndoBookmark(editor.selection));
  }
};

export const addUndoLevel = (
  editor: Editor,
  undoManager: UndoManager,
  index: Index,
  locks: Locks,
  beforeBookmark: UndoBookmark,
  level?: Partial<UndoLevel>,
  event?: Event
): UndoLevel | null => {
  const currentLevel = Levels.createFromEditor(editor);

  const newLevel = Tools.extend(level || {}, currentLevel) as UndoLevel;

  if (!isUnlocked(locks) || editor.removed) {
    return null;
  }

  const lastLevel = undoManager.data[index.get()];
  if (editor.dispatch('BeforeAddUndo', { level: newLevel, lastLevel, originalEvent: event }).isDefaultPrevented()) {
    return null;
  }

  // Add undo level if needed
  if (lastLevel && Levels.isEq(lastLevel, newLevel)) {
    return null;
  }

  // Set before bookmark on previous level
  if (undoManager.data[index.get()]) {
    beforeBookmark.get().each((bm) => {
      undoManager.data[index.get()].beforeBookmark = bm;
    });
  }

  // Time to compress
  const customUndoRedoLevels = Options.getCustomUndoRedoLevels(editor);

  if (customUndoRedoLevels) {
    if (undoManager.data.length > customUndoRedoLevels) {
      for (let i = 0; i < undoManager.data.length - 1; i++) {
        undoManager.data[i] = undoManager.data[i + 1];
      }

      undoManager.data.length--;
      index.set(undoManager.data.length);
    }
  }

  // Get a non intrusive normalized bookmark
  newLevel.bookmark = GetBookmark.getUndoBookmark(editor.selection);

  // Crop array if needed
  if (index.get() < undoManager.data.length - 1) {
    undoManager.data.length = index.get() + 1;
  }

  undoManager.data.push(newLevel);
  index.set(undoManager.data.length - 1);

  const args = { level: newLevel, lastLevel, originalEvent: event };

  if (index.get() > 0) {
    editor.setDirty(true);
    editor.dispatch('AddUndo', args);
    editor.dispatch('change', args);
  } else {
    editor.dispatch('AddUndo', args);
  }

  return newLevel;
};

export const clear = (editor: Editor, undoManager: UndoManager, index: Index): void => {
  undoManager.data = [];
  index.set(0);
  undoManager.typing = false;
  editor.dispatch('ClearUndos');
};

export const extra = (editor: Editor, undoManager: UndoManager, index: Index, callback1: () => void, callback2: () => void): void => {
  if (undoManager.transact(callback1)) {
    const bookmark = undoManager.data[index.get()].bookmark;
    const lastLevel = undoManager.data[index.get() - 1];
    Levels.applyToEditor(editor, lastLevel, true);

    if (undoManager.transact(callback2)) {
      undoManager.data[index.get() - 1].beforeBookmark = bookmark;
    }
  }
};

export const redo = (editor: Editor, index: Index, data: UndoLevel[]): UndoLevel | undefined => {
  let level: UndoLevel | undefined;

  if (index.get() < data.length - 1) {
    index.set(index.get() + 1);
    level = data[index.get()];
    Levels.applyToEditor(editor, level, false);
    editor.setDirty(true);
    editor.dispatch('Redo', { level });
  }

  return level;
};

export const undo = (editor: Editor, undoManager: UndoManager, locks: Locks, index: Index): UndoLevel | undefined => {
  let level: UndoLevel | undefined;

  if (undoManager.typing) {
    undoManager.add();
    undoManager.typing = false;
    setTyping(undoManager, false, locks);
  }

  if (index.get() > 0) {
    index.set(index.get() - 1);
    level = undoManager.data[index.get()];
    Levels.applyToEditor(editor, level, true);
    editor.setDirty(true);
    editor.dispatch('Undo', { level });
  }

  return level;
};

export const reset = (undoManager: UndoManager): void => {
  undoManager.clear();
  undoManager.add();
};

export const hasUndo = (editor: Editor, undoManager: UndoManager, index: Index): boolean =>
  // Has undo levels or typing and content isn't the same as the initial level
  index.get() > 0 || (undoManager.typing && undoManager.data[0] && !Levels.isEq(Levels.createFromEditor(editor), undoManager.data[0]));

export const hasRedo = (undoManager: UndoManager, index: Index): boolean =>
  index.get() < undoManager.data.length - 1 && !undoManager.typing;

export const transact = (undoManager: UndoManager, locks: Locks, callback: () => void): UndoLevel | null => {
  endTyping(undoManager, locks);
  undoManager.beforeChange();
  undoManager.ignore(callback);
  return undoManager.add();
};

export const ignore = (locks: Locks, callback: () => void): void => {
  try {
    locks.set(locks.get() + 1);
    callback();
  } finally {
    locks.set(locks.get() - 1);
  }
};
