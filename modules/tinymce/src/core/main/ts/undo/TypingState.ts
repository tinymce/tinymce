import { isUnlocked } from './Locks';
import { Locks, UndoLevel, UndoManager } from './UndoManagerTypes';

export const setTyping = (undoManager: UndoManager, typing: boolean, locks: Locks): void => {
  if (isUnlocked(locks)) {
    undoManager.typing = typing;
  }
};

export const endTyping = (undoManager: UndoManager, locks: Locks): void => {
  if (undoManager.typing) {
    setTyping(undoManager, false, locks);
    undoManager.add();
  }
};

export const endTypingLevelIgnoreLocks = (undoManager: UndoManager): UndoLevel | null => {
  if (undoManager.typing) {
    undoManager.typing = false;
    return undoManager.add();
  }

  return null;
};
