import { addStackTrace, TestLogs } from '../api/TestLogs';
import { console } from '@ephox/dom-globals';

export type NextFn<T> = (value: T, logs: TestLogs) => void;
export type DieFn = (err: any, logs: TestLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;


export const Pipe = function <T, U>(f: RunFn<T, U>): RunFn<T, U> {
  return function (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    try {
      f(value, next, die, logs);
    } catch (err) {
      console.error('Error thrown', err);
      const logsWithTrace = addStackTrace(logs, err);
      die(err, logsWithTrace);
    }
  };
};