import { Failure } from '@ephox/bedrock-common';

import * as AsyncActions from '../pipe/AsyncActions';
import * as GeneralActions from '../pipe/GeneralActions';
import { DieFn, NextFn, Pipe, RunFn } from '../pipe/Pipe';
import { addLogging, GuardFn } from './Guard';
import { addLogEntry, TestLogs } from './TestLogs';

export interface Step<T, U> {
  runStep: (value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => void;
}

const raw = <T, U>(f: RunFn<T, U>): Step<T, U> =>
  ({ runStep: Pipe(f) });

const stateful = <T, U>(f: (v: T, next: (v: U) => void, die: (err) => void) => void): Step<T, U> =>
  raw<T, U>((value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    f(
      value,
      (nextValue: U) => next(nextValue, logs),
      (err) => die(err, logs)
    );
  });

// Chiefly used for limiting things with timeouts.
const control = <T, U, V>(step: Step<T, U>, guard: GuardFn<T, U, V>): Step<T, V> =>
  raw<T, V>((value: T, next: NextFn<V>, die: DieFn, logs: TestLogs) => {
    guard(step.runStep, value, next, die, logs);
  });

const sync = <T>(f: () => void): Step<T, T> =>
  raw<T, T>((value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    f();
    next(value, logs);
  });

const async = <T>(f: (next: () => void, die: (err) => void) => void): Step<T, T> =>
  raw<T, T>((value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    f(
      () => next(value, logs),
      (err) => die(err, logs)
    );
  });

// Convenience functions
const debugging: Step<any, any> =
  sync<any>(GeneralActions.debug);

const log = <T>(message: string): Step<T, T> =>
  raw<T, T>((value: T, next: NextFn<T>, die: DieFn, logs: TestLogs) => {
    // eslint-disable-next-line no-console
    console.log(message);
    next(value, addLogEntry(logs, message));
  });

const label = <T, U>(label: string, chain: Step<T, U>): Step<T, U> =>
  control(chain, addLogging(label));

const wait = <T>(amount: number): Step<T, T> =>
  async(AsyncActions.delay(amount));

const fail = <T>(message: string): Step<T, T> =>
  async(AsyncActions.fail(message));

const pass: Step<any, any> = sync<any>(GeneralActions.pass);

const predicate = <T>(p: (value: T) => boolean): Step<T, T> =>
  stateful((value: T, next, die) => {
    p(value) ? next(value) : die('predicate did not succeed');
  });

const toPromise = <A, B>(step: Step<A, B>) => (a: A): Promise<B> => {
  return new Promise(((resolve, reject) => {
    step.runStep(a,
      (b, _logs) => {
        // TODO: What to do with logs? We lose them.
        resolve(b);
      }, (err, logs) => {
        reject(Failure.prepFailure(err, logs));
      },
      TestLogs.init()
    );
  }));
};

const fromPromise = <T>(p: () => Promise<unknown>): Step<T, T> => Step.async<T>((next, die) => {
  p().then(next, die);
});

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
  raw,
  predicate,
  toPromise,
  fromPromise
};
