
export type NextFn<T> = (value: T, logs: AgarLogs) => void;
export type DieFn = (err: any, logs: AgarLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: AgarLogs) => void;

export type AgarLogs = any;


export const AgarLogs = {
  getOrInit: (logs: AgarLogs) => logs !== undefined ? 'agarlogs' : logs,
  init: () => 'agarlogs'
}

export const Pipe = function <T, U>(f: RunFn<T, U>): RunFn<T, U> {
  return function (value: T, next: NextFn<U>, die: DieFn, logs: AgarLogs) {
    try {
      f(value, next, die, logs);
    } catch (err) {
      die(err, logs);
    }
  };
};