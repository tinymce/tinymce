import { Fun, Option } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { nuState } from '../../behaviour/common/BehaviourState';
import { DragModeDeltas, DragStartData, BaseDraggingState } from './DraggingTypes';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
const init = <T>(): BaseDraggingState<T> => {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  let previous = Option.none<T>();
  // Dragging requires calculating the bounds, so we store that data initially
  // to reduce the amount of computation each mouse movement
  let startData = Option.none<DragStartData>();

  const reset = (): void => {
    previous = Option.none();
    startData = Option.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const calculateDelta = (mode: DragModeDeltas<T>, nu: T): Option<T> => {
    const result = previous.map((old) => mode.getDelta(old, nu));

    previous = Option.some(nu);
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  const update = (mode: DragModeDeltas<T>, dragEvent: EventArgs): Option<T> => mode.getData(dragEvent).bind((nuData) => calculateDelta(mode, nuData));

  const setStartData = (data: DragStartData) => {
    startData = Option.some(data);
  };

  const getStartData = (): Option<DragStartData> => startData;

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
