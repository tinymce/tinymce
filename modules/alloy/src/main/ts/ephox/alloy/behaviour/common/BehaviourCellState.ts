import { Cell } from '@ephox/katamari';
import { BehaviourState } from './BehaviourState';

export interface BehaviourCellState<T> extends BehaviourState {
  get: () => T;
  set: (newState: T) => void;
  clear: () => void;
  readState: () => any;
}

export const SetupBehaviourCellState = <T>(initialState: T) => {
  const init = (): BehaviourCellState<T> => {
    const cell = Cell<T>(initialState);

    const get = () => cell.get();
    const set = (newState: T) => cell.set(newState);
    const clear = () => cell.set(initialState);
    const readState = (): any => cell.get();

    return {
      get,
      set,
      clear,
      readState
    };
  };

  return {
    init
  };
};
