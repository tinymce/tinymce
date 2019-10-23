import { addStackTrace, TestLogs } from '../api/TestLogs';

export type NextFn<T> = (value: T, logs: TestLogs) => void;
export type DieFn = (err: any, logs: TestLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;

export const Pipe = <T, U>(f: RunFn<T, U>): RunFn<T, U> => {
  return (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs): void => {
    try {
      f(value, next, die, logs);
    } catch (err) {
      const logsWithTrace = addStackTrace(logs, err);
      die(err, logsWithTrace);
    }
  };
};
