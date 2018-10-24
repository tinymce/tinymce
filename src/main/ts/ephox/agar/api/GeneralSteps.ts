import { clearInterval, setInterval, setTimeout } from '@ephox/dom-globals';

import { DieFn, NextFn } from '../pipe/Pipe';
import { Pipeline } from './Pipeline';
import { Step } from './Step';
import { TestLogs } from './TestLogs';

// This module needs tests
const sequence = function (steps: Step<any, any>[]) {
  return Step.raw<any, any>((value, next, die, initLogs: TestLogs) => {
    Pipeline.async(value, steps, next, die, initLogs);
  });
};

const repeat = function <T>(amount: number, step: Step<T, T>): Step<T, T>[] {
  const steps: Step<T, T>[] = [];
  for (let i = 0; i < amount; i++) {
    steps.push(step);
  }
  return steps;
};

const sequenceRepeat = function <T>(amount: number, step: Step<T, T>): Step<T, T> {
  const steps = repeat(amount, step);
  return sequence(steps);
};

// TODO deprecate? This function is weird and we don't seem to use it.
const repeatUntil = function <T, U>(label: string, repeatStep: Step<T, T>, successStep: Step<T, U>, numAttempts: number) {
  return Step.raw((value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    const again = function (num: number) {
      if (num <= 0) {
        die(label + '\nRan out of attempts', logs);
      } else {
        repeatStep(value, function () {
          // Any fancy setting of log here? Or ignore previous attempts?
          successStep(value, next, function () {
            again(num - 1);
          }, logs);
        }, die, logs);
      }
    };

    again(numAttempts);
  });
};

const waitForPredicate = <T>(label: string, interval: number, amount: number, predicate: () => boolean) => {
  return Step.async<T>((next, die) => {
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