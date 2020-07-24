import { Cell, Fun, Optional } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { TooltippingState } from './TooltippingTypes';

const init = (): TooltippingState => {
  const timer = Cell(Optional.none<number>());
  const popup = Cell(Optional.none<AlloyComponent>());

  const getTooltip = () => popup.get();

  const setTooltip = (comp: AlloyComponent) => {
    popup.set(Optional.some(comp));
  };

  const clearTooltip = () => {
    popup.set(Optional.none());
  };

  const clearTimer = () => {
    timer.get().each((t) => {
      clearTimeout(t);
    });
  };

  const resetTimer = (f: () => any, delay: number) => {
    clearTimer();
    timer.set(
      Optional.some(
        setTimeout(
          () => {
            f();
          },
          delay
        )
      )
    );
  };

  const isShowing = () => popup.get().isSome();

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
