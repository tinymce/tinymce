import { Type } from '@ephox/katamari';

export interface PauseController {
  readonly wait: (timeout?: number) => Promise<void>;
  readonly resume: () => void;
}

export const createPauseController = (): PauseController => {
  let resolveFn: (() => void) | null = null;
  let promise: Promise<void> | null = null;
  let timer: number;

  const reset = () => {
    window.clearTimeout(timer);
    resolveFn = null;
    promise = null;
  };

  const wait = (timeout: number = 5000) => {
    if (Type.isNullable(promise)) {
      promise = new Promise<void>((resolve, reject) => {
        resolveFn = resolve;

        timer = window.setTimeout(() => {
          reject(new Error(`PauseController wait timed out after ${timeout}ms`));
          reset();
        }, timeout);
      });
    }

    return promise;
  };

  const resume = () => {
    if (Type.isNonNullable(promise) && Type.isNonNullable(resolveFn)) {
      resolveFn();
      reset();
    }
  };

  return {
    wait,
    resume
  };
};
