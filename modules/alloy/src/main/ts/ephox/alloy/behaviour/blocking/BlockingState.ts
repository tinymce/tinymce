import { Cell, Optional } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourState, nuState } from '../common/BehaviourState';

export interface BlockingState extends BehaviourState {
  setBlocker: (actual: AlloyComponent, destroy: () => void) => void;
  clearBlocker: () => void;
  getBlocked: () => boolean;
  setBlocked: (blocked: boolean) => void;
}

const init = (): BlockingState => {
  const blocker = Cell(Optional.none<{ actual: AlloyComponent; destroy: () => void }>());
  const blocked = Cell(false);

  const readState = () => ({
    blocker: blocker.get().map((comp) => comp.actual.element.dom as HTMLElement),
    blocked: blocked.get()
  });
  const setBlocker = (actual: AlloyComponent, destroy: () => void) => {
    clearBlocker();
    blocker.set(Optional.some({ actual, destroy }));
  };
  const clearBlocker = () => {
    blocker.get().each((blocker) => blocker.destroy());
    blocker.set(Optional.none());
  };
  const getBlocked = blocked.get;
  const setBlocked = blocked.set;

  return nuState({
    readState,
    setBlocker,
    clearBlocker,
    getBlocked,
    setBlocked
  });
};

export const BlockingState = {
  init
};