import { Cell, Fun, Option } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';

const init = () => {
  const contents = Cell(Option.none());

  const readState = Fun.constant('not-implemented');

  const isOpen = () => {
    return contents.get().isSome();
  };

  const set = (c) => {
    contents.set(Option.some(c));
  };

  const get = (c) => {
    return contents.get();
  };

  const clear = () => {
    contents.set(Option.none());
  };

  return nuState({
    readState,
    isOpen,
    clear,
    set,
    get
  });
};

export {
  init
};
