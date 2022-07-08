import { isUnlocked } from './Locks';
import { Locks, UndoManager } from './UndoManagerTypes';

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

export const endTypingLevelIgnoreLocks = (undoManager: UndoManager): void => {
  if (undoManager.typing) {
    undoManager.typing = false;
    undoManager.add();
  }
};
