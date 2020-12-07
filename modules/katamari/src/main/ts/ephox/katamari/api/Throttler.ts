export interface Throttler<A extends any[]> {
  readonly cancel: () => void;
  readonly throttle: (...args: A) => void;
}

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, update the arguments f will run
// with (but keep the current schedule)
export const adaptable = function <A extends any[]> (fn: (...a: A) => void, rate: number): Throttler<A> {
  let timer: number | null = null;
  let args: A | null = null;
  const cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      args = null;
    }
  };
  const throttle = function (...newArgs: A) {
    args = newArgs;
    if (timer === null) {
      timer = setTimeout(function () {
        const blargs = args === null ? [] : args;
        fn.apply(null, blargs);
        timer = null;
        args = null;
      }, rate);
    }
  };

  return {
    cancel,
    throttle
  };
};

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, ignore it completely.
export const first = function <A extends any[]> (fn: (...a: A) => void, rate: number): Throttler<A> {
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
    cancel,
    throttle
  };
};

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, reschedule the function again
// with the new arguments.
export const last = function <A extends any[]> (fn: (...a: A) => void, rate: number): Throttler<A> {
  let timer: number | null = null;
  const cancel = function () {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = function (...args) {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      fn.apply(null, args);
      timer = null;
    }, rate);
  };

  return {
    cancel,
    throttle
  };
};
