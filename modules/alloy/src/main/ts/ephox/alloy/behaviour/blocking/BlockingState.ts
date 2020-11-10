import { Cell, Singleton } from '@ephox/katamari';
import { BehaviourState, nuState } from '../common/BehaviourState';

export interface BlockingState extends BehaviourState {
  // We don't actually store the blocker, just a callback to delete it
  setBlocker: (destroy: () => void) => void;
  clearBlocker: () => void;
  getBlocked: () => boolean;
  setBlocked: (blocked: boolean) => void;
}

export const init = (): BlockingState => {
  const blocker = Singleton.destroyable();
  const blocked = Cell(false);

  const readState = () => ({
    blocked: blocked.get()
  });
  const setBlocker = (destroy: () => void) => {
    blocker.set({ destroy });
  };
  const clearBlocker = blocker.clear;
  const getBlocked = blocked.get;
  const setBlocked = blocked.set;

  return nuState({
    readState,
    setBlocker,
    clearBlocker,
    getBlocked,
    setBlocked
  });
};
