import { clearTimeout, setTimeout } from '@ephox/dom-globals';

// Run a function fn afer rate ms. If another invocation occurs
// during the time it is waiting, update the arguments f will run
// with (but keep the current schedule)
export const adaptable = function (fn: Function, rate: number) {
  let timer: number | null = null;
  let args: any[] | null = null;
  const cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      args = null;
    }
  };
  const throttle = function (...newArgs) {
    args = newArgs;
    if (timer === null) {
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
        args = null;
      }, rate);
    }
  };

  return {
    cancel: cancel,
    throttle: throttle
  };
};

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, ignore it completely.
export const first = function (fn: Function, rate: number) {
  let timer: number | null = null;
  const cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = function (...args) {
    if (timer === null) {
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
      }, rate);
    }
  };

  return {
    cancel: cancel,
    throttle: throttle
  };
};

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, reschedule the function again
// with the new arguments.
export const last = function (fn: Function, rate: number) {
  let timer: number | null = null;
  const cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = function (...args) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
      timer = null;
    }, rate);
  };

  return {
    cancel: cancel,
    throttle: throttle
  };
};
