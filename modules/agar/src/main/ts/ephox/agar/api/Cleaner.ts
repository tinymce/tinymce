import { Arr } from '@ephox/katamari';

type Task = () => void;

export interface Cleaner {
  readonly add: (task: Task) => void;
  readonly run: () => void;
  readonly wrap: <T extends any[], U>(fn: (...a: T) => U) => (...args: T) => U;
}

export const Cleaner = (): Cleaner => {
  let tasks: Task[] = [];

  const add = (task: Task) => {
    tasks.push(task);
  };

  const run = () => {
    Arr.each(tasks, (task) => {
      try {
        task();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    });
    tasks = [];
  };

  const wrap = <T extends any[], U> (fn: (...a: T) => U) => (...args: T): U => {
    run();
    return fn.apply(null, args);
  };

  return {
    add,
    run,
    wrap
  };
};
