import { Fun, Singleton } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { TooltippingState } from './TooltippingTypes';

const init = (): TooltippingState => {
  const timer = Singleton.value<number>();
  const popup = Singleton.value<AlloyComponent>();

  const clearTimer = () => {
    timer.on(clearTimeout);
  };

  const resetTimer = (f: () => void, delay: number) => {
    clearTimer();
    timer.set(setTimeout(f, delay));
  };

  const readState = Fun.constant('not-implemented');

  return nuState({
    getTooltip: popup.get,
    isShowing: popup.isSet,
    setTooltip: popup.set,
    clearTooltip: popup.clear,
    clearTimer,
    resetTimer,
    readState
  });

};

export {
  init
};
