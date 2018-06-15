import { setTimeout, clearTimeout } from "@ephox/dom-globals";

export default (fun: (any) => void, delay: number): { cancel: () => void; schedule: (...any) => void } => {
  let ref = null;

  const schedule = function (...any): void {
    const args = arguments;
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
}