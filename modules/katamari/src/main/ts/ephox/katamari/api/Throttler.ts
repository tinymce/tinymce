import * as Type from './Type';

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
    if (!Type.isNull(timer)) {
      clearTimeout(timer);
      timer = null;
      args = null;
    }
  };
  const throttle = (...newArgs: A) => {
    args = newArgs;
    if (Type.isNull(timer)) {
      timer = setTimeout(() => {
        const tempArgs = args;
        timer = null;
        args = null;
        fn.apply(null, tempArgs as A);
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
    if (!Type.isNull(timer)) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = (...args: A) => {
    if (Type.isNull(timer)) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(null, args);
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
    if (!Type.isNull(timer)) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = (...args: A) => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fn.apply(null, args);
    }, rate);
  };

  return {
    cancel,
    throttle
  };
};
