import { Singleton } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { DisableState } from './DisableTypes';

const init = (): DisableState => {
  const lastDisabledState = Singleton.value<boolean>();

  const readState = () => 'last disabled state:' + lastDisabledState.get();

  return nuState({
    getLastDisabledState: () => lastDisabledState.get(),
    setLastDisabledState: lastDisabledState.set,
    readState
  });
};

export {
  init
};
