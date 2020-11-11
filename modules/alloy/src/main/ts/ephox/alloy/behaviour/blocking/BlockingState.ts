import { Cell, Singleton } from '@ephox/katamari';
import { nuState } from '../common/BehaviourState';
import { BlockingState } from './BlockingTypes';

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
