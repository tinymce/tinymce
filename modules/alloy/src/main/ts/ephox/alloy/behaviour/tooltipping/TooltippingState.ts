import { setTimeout, clearTimeout } from '@ephox/dom-globals';
import { Fun, Option, Cell } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';

const init = () => {
  const timer = Cell(Option.none());
  const popup = Cell(Option.none());

  const getTooltip = () => {
    return popup.get();
  };

  const setTooltip = (s: string) => {
    popup.set(Option.some(s));
  };

  const clearTooltip = () => {
    popup.set(Option.none());
  };

  const clearTimer = () => {
    timer.get().each((t) => {
      clearTimeout(t);
    });
  };

  const resetTimer = (f: () => any, delay: number) => {
    clearTimer();
    timer.set(
      Option.some(
        setTimeout(
          () => {
            f();
          },
          delay
        )
      )
    );
  };

  const isShowing = () => {
    return popup.get().isSome();
  };

  const readState = Fun.constant('not-implemented');

  return nuState({
    getTooltip,
    isShowing,
    setTooltip,
    clearTooltip,
    clearTimer,
    resetTimer,
    readState
  });

};

export {
  init
};
