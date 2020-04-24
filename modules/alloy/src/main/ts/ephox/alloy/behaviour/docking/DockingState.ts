import { Cell, Option } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { DockingConfig, DockingMode, DockingState, InitialDockingPosition } from './DockingTypes';

const init = (spec: DockingConfig): DockingState => {
  const docked = Cell(false);
  const visible = Cell(true);
  const initialBounds = Cell(Option.none<InitialDockingPosition>());
  const modes = Cell<DockingMode[]>(spec.modes);

  const readState = () => `docked:  ${docked.get()}, visible: ${visible.get()}, modes: ${modes.get().join(',')}`;

  return nuState({
    isDocked: docked.get,
    setDocked: docked.set,
    getInitialPosition: initialBounds.get,
    setInitialPosition: initialBounds.set,
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
