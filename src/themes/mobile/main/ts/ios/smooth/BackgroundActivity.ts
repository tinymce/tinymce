import { Cell } from '@ephox/katamari';
import { LazyValue } from '@ephox/katamari';



export default <any> function (doAction) {
  // Start the activity in idle state.
  var action = Cell(
    LazyValue.pure({})
  );

  var start = function (value) {
    var future = LazyValue.nu(function (callback) {
      return doAction(value).get(callback);
    });

    // Note: LazyValue kicks off immediately
    action.set(future);
  };

  // Idle will fire g once the current action is complete.
  var idle = function (g) {
    action.get().get(function () {
      g();
    });
  };

  return {
    start: start,
    idle: idle
  };
};