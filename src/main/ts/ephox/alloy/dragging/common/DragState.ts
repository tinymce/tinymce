import { Fun, Option } from '@ephox/katamari';

import BehaviourState from '../../behaviour/common/BehaviourState';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
const init = function () {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  let previous = Option.none();

  const reset = function () {
    previous = Option.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const calculateDelta = function (mode, nu) {
    const result = previous.map(function (old) {
      return mode.getDelta(old, nu);
    });

    previous = Option.some(nu);
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  const update = function (mode, dragEvent) {
    return mode.getData(dragEvent).bind(function (nuData) {
      return calculateDelta(mode, nuData);
    });
  };

  const readState = Fun.constant({ });

  return BehaviourState({
    readState,
    reset,
    update
  });
};

export {
  init
};