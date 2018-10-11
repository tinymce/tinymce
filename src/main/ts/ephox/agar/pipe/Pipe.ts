import { Arr } from "@ephox/katamari";

export type NextFn<T> = (value: T, logs: AgarLogs) => void;
export type DieFn = (err: any, logs: AgarLogs) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: AgarLogs) => void;

export interface AgarLogEntry {
  message: string;
  trace?: any;
}

export interface AgarLogs {
  history: AgarLogEntry[ ]
};

// TODO: Make a Cons List for efficiency
export const addLogEntry = (logs: AgarLogs, message: string) => {
  return {
    history: logs.history.concat([
      { message }
    ])
  };
}

const initLogsWith = (history: AgarLogEntry[]) => {
  return {
    history: history
  };
}

export const AgarLogs = {
  getOrInit: (logs: AgarLogs): AgarLogs => logs !== undefined ? logs : initLogsWith([ ]),
  init: (): AgarLogs => initLogsWith([ ])
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