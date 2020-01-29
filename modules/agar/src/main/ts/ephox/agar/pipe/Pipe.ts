import { addStackTrace, TestLogs } from '../api/TestLogs';
import { setTimeout } from '@ephox/dom-globals';

export type NextFn<T> = (value: T, logs: TestLogs) => void;
export type DieFn = (err: any, logs: TestLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;

const callAsync = (f) => {
  // tslint:disable-next-line:no-unimported-promise
  typeof Promise !== 'undefined' ? Promise.resolve().then(f) : setTimeout(f, 0);
};

export const Pipe = <T, U>(f: RunFn<T, U>): RunFn<T, U> => {
  return (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs): void => {
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
};
