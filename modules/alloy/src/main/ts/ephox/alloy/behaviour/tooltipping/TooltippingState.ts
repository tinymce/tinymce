import { setTimeout, clearTimeout } from '@ephox/dom-globals';
import { Fun, Option, Cell } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { TooltippingState } from './TooltippingTypes';

const init = (): TooltippingState => {
  const timer = Cell(Option.none<number>());
  const popup = Cell(Option.none<AlloyComponent>());

  const getTooltip = () => {
    return popup.get();
  };

  const setTooltip = (comp: AlloyComponent) => {
    popup.set(Option.some(comp));
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
