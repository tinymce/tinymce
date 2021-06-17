import { PlatformDetection } from '@ephox/sand';
import Promise from '@ephox/wrap-promise-polyfill';

import { addStackTrace, TestLogs } from '../api/TestLogs';

export type NextFn<T> = (value: T, logs: TestLogs) => void;
export type DieFn = (err: any, logs: TestLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;

const callAsync = (f: () => void) => {
  // Many IE 11 tests unfortunately rely on using the setTimeout, so we can't remove this unfortunately
  PlatformDetection.detect().browser.isIE() ? setTimeout(f, 0) : Promise.resolve().then(f);
};

export const Pipe = <T, U>(f: RunFn<T, U>): RunFn<T, U> => (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs): void => {
  const bounceNext = (value, nextLogs) => callAsync(() => {
    next(value, nextLogs);
  });

  try {
    f(value, bounceNext, die, logs);
  } catch (err) {
    const logsWithTrace = addStackTrace(logs, err);
    die(err, logsWithTrace);
  }
};
