import { Cell } from '@ephox/katamari';

import { BehaviourState, BehaviourStateInitialiser } from './BehaviourState';

export interface BehaviourCellState<T> extends BehaviourState {
  readonly get: () => T;
  readonly set: (newState: T) => void;
  readonly clear: () => void;
  readonly readState: () => any;
}

export const SetupBehaviourCellState = <T>(initialState: T): BehaviourStateInitialiser<any, BehaviourCellState<T>> => {
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
