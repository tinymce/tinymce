import { DieFn, NextFn, RunFn } from '../pipe/Pipe';
import { Pipeline } from './Pipeline';
import * as Step from './Step';

// This module needs tests
const sequence = function (steps: RunFn<any, any>[], delay_doNotUse?: number) {
  return Step.stateful<any, any>(function (value, next, die) {
    Pipeline.async(value, steps, next, die, delay_doNotUse);
  });
};

const repeat = function <T>(amount: number, step: RunFn<T, T>): RunFn<T, T>[] {
  const steps: RunFn<T, T>[] = [];
  for (let i = 0; i < amount; i++) {
    steps.push(step);
  }
  return steps;
};

const sequenceRepeat = function <T>(amount: number, step: RunFn<T, T>): RunFn<T, T> {
  const steps = repeat(amount, step);
  return sequence(steps);
};

// TODO deprecate? This function is weird and we don't seem to use it.
const repeatUntil = function <T, U>(label: string, repeatStep: RunFn<T, T>, successStep: RunFn<T, U>, numAttempts: number) {
  return Step.stateful(function (value: T, next: NextFn<U>, die: DieFn) {
    const again = function (num: number) {
      if (num <= 0) {
        die(label + '\nRan out of attempts');
      } else {
        repeatStep(value, function () {
          successStep(value, next, function () {
            again(num - 1);
          });
        }, die);
      }
    };

    again(numAttempts);
  });
};

const waitForPredicate = function <T>(label: string, interval: number, amount: number, predicate: () => boolean) {
  return Step.async<T>(function (next, die) {
    if (predicate()) {
      // Must use a setTimeout here otherwise FontSizeTest gets 'too much recursion' on Firefox
      setTimeout(function () { next(); });
      return;
    }
    let counter = 0;
    const timer = setInterval(function () {
      counter += interval;
      try {
        if (predicate()) {
          clearInterval(timer);
          next();
          return;
        }
      } catch (err) {
        clearInterval(timer);
        die(err);
        return;
      }

      if (counter > amount) {
        clearInterval(timer);
        die('Waited for ' + label + ' for ' + amount + '(' + counter + '/' + interval + ') ms. Predicate condition failed.');
      }

    }, interval);
  });
};

export {
  sequence,
  repeatUntil,
  waitForPredicate,
  repeat,
  sequenceRepeat
};