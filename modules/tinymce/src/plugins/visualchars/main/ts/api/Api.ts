import { Cell } from '@ephox/katamari';

export interface Api {
  readonly isEnabled: () => boolean;
}

const get = (toggleState: Cell<boolean>): Api => {
  const isEnabled = () => {
    return toggleState.get();
  };

  return {
    isEnabled
  };
};

export {
  get
};
