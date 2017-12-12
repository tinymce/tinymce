import BehaviourState from '../../behaviour/common/BehaviourState';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
var init = function () {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  var previous = Option.none();

  var reset = function () {
    previous = Option.none();
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  var calculateDelta = function (mode, nu) {
    var result = previous.map(function (old) {
      return mode.getDelta(old, nu);
    });

    previous = Option.some(nu);
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  var update = function (mode, dragEvent) {
    return mode.getData(dragEvent).bind(function (nuData) {
      return calculateDelta(mode, nuData);
    });
  };

  var readState = Fun.constant({ });

  return BehaviourState({
    readState: readState,
    reset: reset,
    update: update
  });
};

export default <any> {
  init: init
};