import { addStackTrace, TestLogs } from '../api/TestLogs';

export type NextFn<T> = (value: T, logs: TestLogs) => void;
export type DieFn = (err: any, logs: TestLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;

export const Pipe = <T, U>(f: RunFn<T, U>): RunFn<T, U> => (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs): void => {
  const bounceNext = (value, nextLogs) => {
    Promise.resolve().then(() => {
      next(value, nextLogs);
    });
  };

  try {
    f(value, bounceNext, die, logs);
  } catch (err) {
    const logsWithTrace = addStackTrace(logs, err);
    die(err, logsWithTrace);
  }
};
