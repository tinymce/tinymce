import { Objects } from '@ephox/boulder';
import { Fun, Obj, Option, Cell } from '@ephox/katamari';
import { JSON } from '@ephox/sand';
import { TooltippingConfigSpec, TooltippingConfig } from './TooltippingTypes';
import { BehaviourState, nuState, BehaviourStateInitialiser } from '../common/BehaviourState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { setTimeout, clearTimeout } from '@ephox/dom-globals';

const init = () => {
  const timer = Cell(Option.none());
  const popup = Cell(Option.none());

  const getTooltip = () => {
    return popup.get();
  };

  const setTooltip = (s) => {
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

  const resetTimer = (f, delay) => {
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