import { Cell, Fun, Optional } from '@ephox/katamari';

import { ReflectingState } from './ReflectingTypes';

const init = <S>(): ReflectingState<S> => {
  const cell: Cell<Optional<S>> = Cell(Optional.none<S>());

  const set = (optS: Optional<S>) => cell.set(optS);
  const clear = () => cell.set(Optional.none<S>());
  const get = () => cell.get();

  const readState = (): any => cell.get().fold<any>(Fun.constant('none'), Fun.identity);

  return {
    readState,
    get,
    set,
    clear
  };
};

export {
  init
};
