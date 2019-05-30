import { console } from '@ephox/dom-globals';

import { addLogEntry, TestLogs } from '../api/TestLogs';
import * as AsyncActions from '../pipe/AsyncActions';
import * as GeneralActions from '../pipe/GeneralActions';
import { DieFn, NextFn, Pipe, RunFn } from '../pipe/Pipe';
import { addLogging, GuardFn } from './Guard';

export type Step<T, U> = (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;

const raw = function <T, U>(f: RunFn<T, U>): Step<T, U> {
  return Pipe(f);
};

const stateful = function <T, U>(f: (v: T, next: (v: U) => void, die: (err) => void) => void): Step<T, U> {
  return Pipe<T, U>((value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    f(
      value,
      (nextValue: U) => next(nextValue, logs),
      (err) => die(err, logs)
    );
  });
};

// Chiefly used for limiting things with timeouts.
const control = function <T, U, V>(step: Step<T, U>, guard: GuardFn<T, U, V>): Step<T, V> {
  return Pipe<T, V>(function (value: T, next: NextFn<V>, die: DieFn, logs: TestLogs) {
    guard(step, value, next, die, logs);
  });
};

const sync = function <T>(f: () => void): Step<T, T> {
  return Pipe<T, T>(function (value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    f();
    next(value, logs);
  });
};

const async = function <T>(f: (next: () => void, die: (err) => void) => void): Step<T, T> {
  return Pipe<T, T>(function (value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    f(
      () => next(value, logs),
      (err) => die(err, logs)
    );
  });
};

// Convenience functions
const debugging = sync<any>(GeneralActions.debug);

const log = function <T>(message: string): Step<T, T> {
  return Pipe<T, T>(function (value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) {
    console.log(message);
    next(value, addLogEntry(logs, message));
  });
};

const label = function <T,U>(label: string, chain: Step<T, U>) {
  return control(chain, addLogging(label));
};

const wait = function <T>(amount: number): Step<T, T> {
  return async<T>(AsyncActions.delay(amount));
};

const fail = function <T>(message: string): Step<T, T> {
  return async<T>(AsyncActions.fail(message));
};

const pass = sync<any>(GeneralActions.pass);

export const Step = {
  stateful,
  control,
  sync,
  async,
  debugging,
  log,
  label,
  wait,
  fail,
  pass,
  raw
};