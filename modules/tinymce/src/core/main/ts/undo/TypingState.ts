/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { isUnlocked } from './Locks';
import { UndoManager, Locks } from './UndoManagerTypes';

export const setTyping = (undoManager: UndoManager, typing: boolean, locks: Locks) => {
  if (isUnlocked(locks)) {
    undoManager.typing = typing;
  }
};

export const endTyping = (undoManager: UndoManager, locks: Locks) => {
  if (undoManager.typing) {
    setTyping(undoManager, false, locks);
    undoManager.add();
  }
};

export const endTypingLevelIgnoreLocks = (undoManager: UndoManager) => {
  if (undoManager.typing) {
    undoManager.typing = false;
    undoManager.add();
  }
};
