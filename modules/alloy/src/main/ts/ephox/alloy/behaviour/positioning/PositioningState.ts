import { Obj, type Optional, Type } from '@ephox/katamari';

import type { PlacerResult } from '../../positioning/layout/LayoutTypes';
import { nuState } from '../common/BehaviourState';

import type { PositioningState } from './PositioningTypes';

export const init = (): PositioningState => {
  let state: Record<string, PlacerResult> = {};

  const set = (id: string, data: PlacerResult) => {
    state[id] = data;
  };

  const get = (id: string): Optional<PlacerResult> =>
    Obj.get(state, id);

  const clear = (id?: string) => {
    if (Type.isNonNullable(id)) {
      delete state[id];
    } else {
      state = {};
    }
  };

  return nuState({
    readState: () => state,
    clear,
    set,
    get
  });
};
