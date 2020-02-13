import { setTimeout, clearTimeout } from '@ephox/dom-globals';

export default <T extends (...args: any[]) => void>(fun: T, delay: number) => {
  let ref: number | null = null;

  const schedule = (...args: Parameters<T>): void => {
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
