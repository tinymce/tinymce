import { clearTimeout, setTimeout } from '@ephox/dom-globals';

import * as ErrorTypes from '../alien/ErrorTypes';
import { DieFn, NextFn, RunFn } from '../pipe/Pipe';
import * as Logger from './Logger';
import { TestLogs, addLogEntry } from './TestLogs';

export type GuardFn<T, U, V> = (run: RunFn<T, U>, value: T, next: NextFn<V>, die: DieFn, logs: TestLogs) => void;

const nu = function <T, U, V>(f: GuardFn<T, U, V>) {
  return f;
};

const tryUntilNot = function <T, U>(label: string, interval: number, amount: number) {
  return nu<T, U, T>(function (f: RunFn<T, U>, value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    const repeat = function (n: number) {
      f(value, function (v, newLogs) {
        if (n <= 0) die(new Error('Waited for ' + amount + 'ms for something to be unsuccessful. ' + label), newLogs);
        else {
          setTimeout(function () {
            repeat(n - interval);
          }, interval);
        }
      }, function (err, newLogs) {
        // Note, this one is fairly experimental. Because errors cause die as well, this is probably not always the best
        // option. What we do is check to see if it is an error prototype
        if (Error.prototype.isPrototypeOf(err)) die(err, newLogs);
        else next(value, newLogs);
      }, logs);
    };
    repeat(amount);
  });
};

const tryUntil = function <T, U>(label: string, interval: number, amount: number) {
  return nu<T, U, U>(function (f: RunFn<T, U>, value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    const repeat = function (n: number) {
      f(value, (v, newLogs) => {
        next(v, addLogEntry(newLogs, 'Wait: ' + label + ' = SUCCESS!'))
      }, function (err, newLogs) {
        if (n <= 0) die(
          ErrorTypes.enrichWith('Waited for ' + amount + 'ms for something to be successful. ' + label, err),
          addLogEntry(newLogs, 'Waited for ' + amount + 'ms for something to be successful. ')
        );
        else {
          setTimeout(function () {
            repeat(n - interval);
          }, interval);
        }
      }, logs);
    };
    repeat(amount);
  });
};

const timeout = function <T, U>(label: string, limit: number) {
  return nu<T, U, U>(function (f: RunFn<T, U>, value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    let passed = false;
    let failed = false;

    const hasNotExited = function () {
      return passed === false && failed === false;
    };

    const timer = setTimeout(function () {
      if (hasNotExited()) {
        failed = true;
        die('Hit the limit (' + limit + ') for: ' + label, logs);
      }
    }, limit);

    f(value, function (v: U, newLogs: TestLogs) {
      clearTimeout(timer);
      if (hasNotExited()) {
        passed = true;
        next(v, newLogs);
      }
    }, function (err, newLogs) {
      if (hasNotExited()) {
        failed = true;
        die(err, newLogs);
      }
    }, logs);
  });
};

const addLogging = function <T, U>(label: string) {
  return nu<T, U, U>(function (f: RunFn<T, U>, value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) {
    return Logger.t(label, f)(value, next, die, logs);
  });
};

export {
  timeout,
  tryUntil,
  tryUntilNot,
  addLogging
};