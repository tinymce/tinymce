import { Locks } from './UndoManagerTypes';

export const isUnlocked = (locks: Locks) => locks.get() === 0;
