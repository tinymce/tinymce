import { Cell, Fun, Optional } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { SandboxingState } from './SandboxingTypes';

const init = (): SandboxingState => {
  const contents = Cell(Optional.none<AlloyComponent>());

  const readState = Fun.constant('not-implemented');

  const isOpen = () => contents.get().isSome();

  const set = (comp: AlloyComponent) => {
    contents.set(Optional.some(comp));
  };

  const get = () => contents.get();

  const clear = () => {
    contents.set(Optional.none());
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
