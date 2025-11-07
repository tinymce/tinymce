import { Type } from '@ephox/katamari';

export interface PauseController {
  readonly wait: () => Promise<void>;
  readonly resume: () => void;
}

export const createPauseController = (): PauseController => {
  let resolveFn: () => void | null = null;
  let promise: Promise<void> | null = null;

  const wait = () => {
    if (Type.isNullable(promise)) {
      promise = new Promise<void>((resolve) => {
        resolveFn = resolve;
      });
    }

    return promise;
  };

  const resume = () => {
    if (Type.isNonNullable(promise) && Type.isNonNullable(resolveFn)) {
      resolveFn();
      promise = null;
    }
  };

  return {
    wait,
    resume
  };
};
