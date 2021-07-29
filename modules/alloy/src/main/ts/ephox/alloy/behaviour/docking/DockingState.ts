import { Cell, Singleton } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { DockingConfig, DockingMode, DockingState, InitialDockingPosition } from './DockingTypes';

const init = (spec: DockingConfig): DockingState => {
  const docked = Cell(false);
  const visible = Cell(true);
  const initialBounds = Singleton.value<InitialDockingPosition>();
  const modes = Cell<DockingMode[]>(spec.modes);

  const readState = () => `docked:  ${docked.get()}, visible: ${visible.get()}, modes: ${modes.get().join(',')}`;

  return nuState({
    isDocked: docked.get,
    setDocked: docked.set,
    getInitialPos: initialBounds.get,
    setInitialPos: initialBounds.set,
    clearInitialPos: initialBounds.clear,
    isVisible: visible.get,
    setVisible: visible.set,
    getModes: modes.get,
    setModes: modes.set,
    readState
  });
};

export {
  init
};
