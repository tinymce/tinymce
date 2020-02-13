import { Cell, Option } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { DockingState, InitialDockingPosition } from './DockingTypes';

const init = (): DockingState => {
  const docked = Cell(false);
  const visible = Cell(true);
  const initialBounds = Cell(Option.none<InitialDockingPosition>());

  const readState = () => {
    return `docked:  ${docked.get()}, visible: ${visible.get()}`;
  };

  return nuState({
    isDocked: () => docked.get(),
    setDocked: (state: boolean) => docked.set(state),
    getInitialPosition: () => initialBounds.get(),
    setInitialPosition: (pos: Option<InitialDockingPosition>) => initialBounds.set(pos),
    isVisible: () => visible.get(),
    setVisible: (state: boolean) => visible.set(state),
    readState
  });
};

export {
  init
};
