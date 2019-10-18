import { console } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';

type Task = () => void;

export interface Cleaner {
  add: (task: Task) => void;
  run: () => void;
  wrap: <T extends any[], U>(fn: (...a: T) => U) => (...args: T) => U;
}

export const Cleaner = () => {
  let tasks: Task[] = [];

  const add = (task: Task) => {
    tasks.push(task);
  };

  const run = () => {
    Arr.each(tasks, (task) => {
      try {
        task();
      } catch (e) {
        // tslint:disable-next-line:no-console
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
    wrap,
  };
};
