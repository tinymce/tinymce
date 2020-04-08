import { Cell, Option } from '@ephox/katamari';

import { ReflectingState } from './ReflectingTypes';

const init = <S>(): ReflectingState<S> => {
  const cell: Cell<Option<S>> = Cell(Option.none<S>());

  const set = (optS: Option<S>) => cell.set(optS);
  const clear = () => cell.set(Option.none<S>());
  const get = () => cell.get();

  const readState = (): any => cell.get().fold<any>(() => 'none', (x) => x);

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
