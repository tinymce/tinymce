import { setTimeout, clearTimeout } from '@ephox/dom-globals';

export default (fun: (any) => void, delay: number) => {
  let ref = null;

  const schedule = (...args): void => {
    ref = setTimeout(() => {
      fun.apply(null, args);
      ref = null;
    }, delay);
  };

  const cancel = (): void => {
    if (ref !== null) {
      clearTimeout(ref);
      ref = null;
    }
  };

  return {
    cancel,
    schedule
  };
};