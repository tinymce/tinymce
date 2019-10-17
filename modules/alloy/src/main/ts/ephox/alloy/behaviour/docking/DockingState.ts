import { Cell } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';

const init = () => {
  const docked = Cell(false);
  const visible = Cell(true);

  const readState = () => {
    return `docked:  ${docked.get()}, visible: ${visible.get()}`;
  };

  return nuState({
    isDocked: () => docked.get(),
    setDocked: (state: boolean) => docked.set(state),
    isVisible: () => visible.get(),
    setVisible: (state: boolean) => visible.set(state),
    readState
  });
};

export {
  init
};
