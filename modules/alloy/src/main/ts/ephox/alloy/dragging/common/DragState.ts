import { Fun, Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { nuState } from '../../behaviour/common/BehaviourState';
import { BaseDraggingState, DragModeDeltas, DragStartData } from './DraggingTypes';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
const init = <T>(): BaseDraggingState<T> => {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  let previous = Optional.none<T>();
  // Dragging requires calculating the bounds, so we store that data initially
  // to reduce the amount of computation each mouse movement
  let startData = Optional.none<DragStartData>();

  const reset = (): void => {
    previous = Optional.none();
    startData = Optional.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const calculateDelta = <E extends Event>(mode: DragModeDeltas<E, T>, nu: T): Optional<T> => {
    const result = previous.map((old) => mode.getDelta(old, nu));

    previous = Optional.some(nu);
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  const update = <E extends Event>(mode: DragModeDeltas<E, T>, dragEvent: EventArgs<E>): Optional<T> =>
    mode.getData(dragEvent).bind((nuData) => calculateDelta(mode, nuData));

  const setStartData = (data: DragStartData) => {
    startData = Optional.some(data);
  };

  const getStartData = (): Optional<DragStartData> => startData;

  const readState = Fun.constant({ });

  return nuState({
    readState,
    reset,
    update,
    getStartData,
    setStartData
  });
};

export {
  init
};
