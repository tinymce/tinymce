export interface Throttler<A extends any[]> {
  readonly cancel: () => void;
  readonly throttle: (...args: A) => void;
}

// Run a function fn after rate ms. If another invocation occurs
// during the time it is waiting, update the arguments f will run
// with (but keep the current schedule)
export const adaptable = <A extends any[]>(fn: (...a: A) => void, rate: number): Throttler<A> => {
  let timer: number | null = null;
  let args: A | null = null;
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      args = null;
    }
  };
  const throttle = (...newArgs: A) => {
    args = newArgs;
    if (timer === null) {
      timer = setTimeout(() => {
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
export const first = <A extends any[]>(fn: (...a: A) => void, rate: number): Throttler<A> => {
  let timer: number | null = null;
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = (...args) => {
    if (timer === null) {
      timer = setTimeout(() => {
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
export const last = <A extends any[]>(fn: (...a: A) => void, rate: number): Throttler<A> => {
  let timer: number | null = null;
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = (...args) => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(null, args);
      timer = null;
    }, rate);
  };

  return {
    cancel,
    throttle
  };
};
