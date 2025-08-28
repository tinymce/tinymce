import { Locks } from './UndoManagerTypes';

export const isUnlocked = (locks: Locks): boolean =>
  locks.get() === 0;
