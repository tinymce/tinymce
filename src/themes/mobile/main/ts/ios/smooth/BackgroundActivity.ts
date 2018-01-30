import { Cell, LazyValue } from '@ephox/katamari';

export default function (doAction) {
  // Start the activity in idle state.
  const action = Cell(
    LazyValue.pure({})
  );

  const start = function (value) {
    const future = LazyValue.nu(function (callback) {
      return doAction(value).get(callback);
    });

    // Note: LazyValue kicks off immediately
    action.set(future);
  };

  // Idle will fire g once the current action is complete.
  const idle = function (g) {
    action.get().get(function () {
      g();
    });
  };

  return {
    start,
    idle
  };
}