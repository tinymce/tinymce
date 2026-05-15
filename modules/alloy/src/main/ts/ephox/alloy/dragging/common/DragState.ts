import { Fun, type Optional, Singleton } from '@ephox/katamari';
import type { EventArgs } from '@ephox/sugar';

import { nuState } from '../../behaviour/common/BehaviourState';

import type { BaseDraggingState, DragModeDeltas, DragStartData } from './DraggingTypes';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
const init = <T>(): BaseDraggingState<T> => {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  const previous = Singleton.value<T>();
  // Dragging requires calculating the bounds, so we store that data initially
  // to reduce the amount of computation each mouse movement
  const startData = Singleton.value<DragStartData>();

  // In a multitouch environment, `pointerId` is used to distinguish pointers
  // (e.g. different fingers on a touchscreen).
  // This property is only used by pointer-event branches.
  const activePointerId = Singleton.value<number>();

  const reset = (): void => {
    previous.clear();
    startData.clear();
    activePointerId.clear();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const calculateDelta = <E extends Event>(mode: DragModeDeltas<E, T>, nu: T): Optional<T> => {
    const result = previous.get().map((old) => mode.getDelta(old, nu));

    previous.set(nu);
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  const update = <E extends Event>(mode: DragModeDeltas<E, T>, dragEvent: EventArgs<E>): Optional<T> =>
    mode.getData(dragEvent).bind((nuData) => calculateDelta(mode, nuData));

  const setStartData = (data: DragStartData) => {
    startData.set(data);
  };

  const getStartData = (): Optional<DragStartData> => startData.get();

  const setActivePointerId = (id: number) => {
    activePointerId.set(id);
  };

  const getActivePointerId = () => activePointerId.get();

  const readState = Fun.constant({ });

  return nuState({
    readState,
    reset,
    update,
    getStartData,
    setStartData,
    setActivePointerId,
    getActivePointerId
  });
};

export {
  init
};
