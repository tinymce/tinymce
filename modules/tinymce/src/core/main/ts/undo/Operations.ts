/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Levels from './Levels';
import Tools from '../api/util/Tools';
import { Event } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { UndoManager, Locks, Index, UndoLevel, UndoBookmark } from './UndoManagerTypes';
import * as GetBookmark from '../bookmark/GetBookmark';
import * as Settings from '../api/Settings';
import { setTyping, endTyping } from './TypingState';
import { isUnlocked } from './Locks';

export const beforeChange = (editor: Editor, locks: Locks, beforeBookmark: UndoBookmark) => {
  if (isUnlocked(locks)) {
    beforeBookmark.set(Option.some(GetBookmark.getUndoBookmark(editor.selection)));
  }
};

export const addUndoLevel = (editor: Editor, undoManager: UndoManager, index: Index, locks: Locks, beforeBookmark: UndoBookmark, level?: UndoLevel, event?: Event) => {
  const currentLevel = Levels.createFromEditor(editor);

  level = level || {} as UndoLevel;
  level = Tools.extend(level, currentLevel);

  if (isUnlocked(locks) === false || editor.removed) {
    return null;
  }

  const lastLevel = undoManager.data[index.get()];
  if (editor.fire('BeforeAddUndo', { level, lastLevel, originalEvent: event }).isDefaultPrevented()) {
    return null;
  }

  // Add undo level if needed
  if (lastLevel && Levels.isEq(lastLevel, level)) {
    return null;
  }

  // Set before bookmark on previous level
  if (undoManager.data[index.get()]) {
    beforeBookmark.get().each((bm) => {
      undoManager.data[index.get()].beforeBookmark = bm;
    });
  }

  // Time to compress
  const customUndoRedoLevels = Settings.getCustomUndoRedoLevels(editor);

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
  level.bookmark = GetBookmark.getUndoBookmark(editor.selection);

  // Crop array if needed
  if (index.get() < undoManager.data.length - 1) {
    undoManager.data.length = index.get() + 1;
  }

  undoManager.data.push(level);
  index.set(undoManager.data.length - 1);

  const args = { level, lastLevel, originalEvent: event };

  editor.fire('AddUndo', args);

  if (index.get() > 0) {
    editor.setDirty(true);
    editor.fire('change', args);
  }

  return level;
};

export const clear = (editor: Editor, undoManager: UndoManager, index: Index) => {
  undoManager.data = [];
  index.set(0);
  undoManager.typing = false;
  editor.fire('ClearUndos');
};

export const extra = (editor: Editor, undoManager: UndoManager, index: Index, callback1: () => void, callback2: () => void) => {
  if (undoManager.transact(callback1)) {
    const bookmark = undoManager.data[index.get()].bookmark;
    const lastLevel = undoManager.data[index.get() - 1];
    Levels.applyToEditor(editor, lastLevel, true);

    if (undoManager.transact(callback2)) {
      undoManager.data[index.get() - 1].beforeBookmark = bookmark;
    }
  }
};

export const redo = (editor: Editor, index: Index, data: UndoLevel[]) => {
  let level: UndoLevel;

  if (index.get() < data.length - 1) {
    index.set(index.get() + 1);
    level = data[index.get()];
    Levels.applyToEditor(editor, level, false);
    editor.setDirty(true);
    editor.fire('Redo', { level });
  }

  return level;
};

export const undo = (editor: Editor, undoManager: UndoManager, locks: Locks, index: Index) => {
  let level: UndoLevel;

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
    editor.fire('Undo', { level });
  }

  return level;
};

export const reset = (undoManager: UndoManager) => {
  undoManager.clear();
  undoManager.add();
};

export const hasUndo = (editor: Editor, undoManager: UndoManager, index: Index) =>
  // Has undo levels or typing and content isn't the same as the initial level
  index.get() > 0 || (undoManager.typing && undoManager.data[0] && !Levels.isEq(Levels.createFromEditor(editor), undoManager.data[0]));

export const hasRedo = (undoManager: UndoManager, index: Index) => index.get() < undoManager.data.length - 1 && !undoManager.typing;

export const transact = (undoManager: UndoManager, locks: Locks, callback: () => void) => {
  endTyping(undoManager, locks);
  undoManager.beforeChange();
  undoManager.ignore(callback);
  return undoManager.add();
};

export const ignore = (locks: Locks, callback: () => void) => {
  try {
    locks.set(locks.get() + 1);
    callback();
  } finally {
    locks.set(locks.get() - 1);
  }
};
