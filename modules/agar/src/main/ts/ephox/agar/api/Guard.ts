import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn, RunFn } from '../pipe/Pipe';
import * as Logger from './Logger';
import { addLogEntry, TestLogs } from './TestLogs';

export type GuardFn<T, U, V> = (run: RunFn<T, U>, value: T, next: NextFn<V>, die: DieFn, logs: TestLogs) => void;

const defaultInterval = 10;
const defaultAmount = 3000;

const tryUntilNot = <T, U>(label: string, interval: number = defaultInterval, amount: number = defaultAmount): GuardFn<T, U, T> =>
  (f: RunFn<T, U>, value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    const repeat = (startTime: number) => {
      f(value, (v, newLogs) => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= amount) {
          die(
            new Error('Waited for ' + amount + 'ms for something to be unsuccessful. ' + label),
            addLogEntry(newLogs, 'WaitErr: ' + label + ' = Failed (after ' + amount + 'ms)')
          );
        } else {
          setTimeout(() => {
            repeat(startTime);
          }, interval);
        }
      }, (err, newLogs) => {
        // Note, this one is fairly experimental.
        // Because errors cause die as well, this is not always the best option.
        // What we do is check to see if it is an error prototype.
        if (Error.prototype.isPrototypeOf(err)) {
          die(err, newLogs);
        } else {
          next(value, addLogEntry(newLogs, 'WaitErr: ' + label + ' = SUCCESS!'));
        }
      }, logs);
    };
    repeat(Date.now());
  };

const tryUntil = <T, U>(label: string, interval: number = defaultInterval, amount: number = defaultAmount): GuardFn<T, U, U> =>
  (f: RunFn<T, U>, value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    const repeat = (startTime: number) => {
      f(value, (v, newLogs) => {
        next(v, addLogEntry(newLogs, 'Wait: ' + label + ' = SUCCESS!'));
      }, (err, newLogs) => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= amount) {
          die(
            ErrorTypes.enrichWith('Waited for ' + amount + 'ms for something to be successful. ' + label, err),
            addLogEntry(newLogs, 'Wait: ' + label + ' = FAILED (after ' + amount + 'ms)')
          );
        } else {
          setTimeout(() => {
            repeat(startTime);
          }, interval);
        }
      }, logs);
    };
    repeat(Date.now());
  };

const timeout = <T, U>(label: string, limit: number): GuardFn<T, U, U> =>
  (f: RunFn<T, U>, value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    let passed = false;
    let failed = false;

    const hasNotExited = () => passed === false && failed === false;

    const timer = setTimeout(() => {
      if (hasNotExited()) {
        failed = true;
        die('Hit the limit (' + limit + ') for: ' + label, logs);
      }
    }, limit);

    f(value, (v: U, newLogs: TestLogs) => {
      clearTimeout(timer);
      if (hasNotExited()) {
        passed = true;
        next(v, newLogs);
      }
    }, (err, newLogs) => {
      if (hasNotExited()) {
        failed = true;
        die(err, newLogs);
      }
    }, logs);
  };

const addLogging = <T, U>(label: string): GuardFn<T, U, U> =>
  (f: RunFn<T, U>, value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) =>
    Logger.t(label, { runStep: f }).runStep(value, next, die, logs);

export {
  timeout,
  tryUntil,
  tryUntilNot,
  addLogging
};
