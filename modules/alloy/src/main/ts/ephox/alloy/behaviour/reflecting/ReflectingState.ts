import { Cell, Optional } from '@ephox/katamari';

import { ReflectingState } from './ReflectingTypes';

const init = <S>(): ReflectingState<S> => {
  const cell = Cell(Optional.none<S>());

  const clear = () => cell.set(Optional.none<S>());

  const readState = (): any => cell.get().getOr('none');

  return {
    readState,
    get: cell.get,
    set: cell.set,
    clear
  };
};

export {
  init
};
