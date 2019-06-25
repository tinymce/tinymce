import { Fun } from '@ephox/katamari';

export type TrampolineFn = () => TrampolineFn | 'trampoline.stop';

// This is used to avoid stack problems.
// Explanation: http://stackoverflow.com/questions/25228871/how-to-understand-trampoline-in-javascript
const run = function (fn: TrampolineFn) {
  let f = fn();
  while (f !== stop) {
    f = f();
  }
};

const stop: 'trampoline.stop' = 'trampoline.stop';

export const Trampoline = {
  stop: Fun.constant(stop),
  run
};