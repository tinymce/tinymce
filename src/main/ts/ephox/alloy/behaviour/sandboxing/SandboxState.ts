import { Cell, Fun, Option } from '@ephox/katamari';

import BehaviourState from '../common/BehaviourState';

const init = function () {
  const contents = Cell(Option.none());

  const readState = Fun.constant('not-implemented');

  const isOpen = function () {
    return contents.get().isSome();
  };

  const set = function (c) {
    contents.set(Option.some(c));
  };

  const get = function (c) {
    return contents.get();
  };

  const clear = function () {
    contents.set(Option.none());
  };

  return BehaviourState({
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