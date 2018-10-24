import { DieFn, NextFn } from '../pipe/Pipe';
import * as Guard from './Guard';
import { Step } from './Step';

const sTryUntilPredicate = function <T>(label: string, predicate: (value: T) => boolean, interval: number, amount: number) {
  const guard = Guard.tryUntil<T, T>(label, interval, amount);
  return Step.control(Step.stateful<T, T>((value: T, next, die) => {
    predicate(value) ? next(value) : die('predicate did not succeed');
  }), guard);
};

const sTryUntil = function <T, U>(label: string, step: Step<T, U>, interval: number, amount: number) {
  const guard = Guard.tryUntil<T, U>(label, interval, amount);
  return Step.control(step, guard);
};

const sTryUntilNot = function <T, U>(label: string, step: Step<T, U>, interval: number, amount: number) {
  const guard = Guard.tryUntilNot<T, U>(label, interval, amount);
  return Step.control(step, guard);
};

const sTimeout = function <T, U>(label: string, step: Step<T, U>, limit: number) {
  const guard = Guard.timeout<T, U>(label, limit);
  return Step.control(step, guard);
};

export {
  sTryUntilPredicate,
  sTryUntil,
  sTryUntilNot,
  sTimeout
};