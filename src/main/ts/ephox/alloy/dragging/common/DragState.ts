import { Fun, Option } from '@ephox/katamari';

import { BehaviourState, nuState } from '../../behaviour/common/BehaviourState';
import { DragModeDeltas } from '../../dragging/common/DraggingTypes';
import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
const init = () => {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  let previous = Option.none();

  const reset = (): void => {
    previous = Option.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const calculateDelta = <T>(mode: DragModeDeltas<T>, nu: T): Option<T> => {
    const result = previous.map((old) => {
      return mode.getDelta(old, nu);
    });

    previous = Option.some(nu);
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  const update = <T>(mode: DragModeDeltas<T>, dragEvent: SugarEvent): Option<T> => {
    return mode.getData(dragEvent).bind((nuData) => {
      return calculateDelta(mode, nuData);
    });
  };

  const readState = Fun.constant({ });

  return nuState({
    readState,
    reset,
    update
  });
};

export {
  init
};