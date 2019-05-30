import { Fun } from '@ephox/katamari';



export default <any> function (anchor) {
  var onEvent = function (event, mode) { };

  return {
    onEvent: onEvent,
    reset: Fun.noop
  };
};