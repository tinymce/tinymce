import { Cell, Fun, Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { nuState } from '../common/BehaviourState';
import { SandboxingState } from './SandboxingTypes';

const init = (): SandboxingState => {
  const contents = Cell(Option.none<AlloyComponent>());

  const readState = Fun.constant('not-implemented');

  const isOpen = () => contents.get().isSome();

  const set = (comp: AlloyComponent) => {
    contents.set(Option.some(comp));
  };

  const get = () => contents.get();

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
