import { DieFn, NextFn } from '../pipe/Pipe';
import { Pipeline } from './Pipeline';
import { Step } from './Step';
import { TestLogs } from './TestLogs';

// This module needs tests
const sequence = (steps: Step<any, any>[]): Step<any, any> =>
  Step.raw<any, any>((value, next, die, initLogs: TestLogs) => {
    Pipeline.async(value, steps, next, die, initLogs);
  });

const repeat = <T>(amount: number, step: Step<T, T>): Step<T, T>[] => {
  const steps: Step<T, T>[] = [];
  for (let i = 0; i < amount; i++) {
    steps.push(step);
  }
  return steps;
};

const sequenceRepeat = <T>(amount: number, step: Step<T, T>): Step<T, T> => {
  const steps = repeat(amount, step);
  return sequence(steps);
};

// TODO deprecate? This function is weird and we don't seem to use it.
const repeatUntil = <T, U>(label: string, repeatStep: Step<T, T>, successStep: Step<T, U>, numAttempts: number): Step<T, U> =>
  Step.raw((value: T, next: NextFn<U>, die: DieFn, logs: TestLogs) => {
    const again = (num: number) => {
      if (num <= 0) {
        die(label + '\nRan out of attempts', logs);
      } else {
        repeatStep.runStep(value, () => {
          // Any fancy setting of log here? Or ignore previous attempts?
          successStep.runStep(value, next, () => {
            again(num - 1);
          }, logs);
        }, die, logs);
      }
    };

    again(numAttempts);
  });

const waitForPredicate = <T>(label: string, interval: number, amount: number, predicate: () => boolean): Step<T, T> =>
  Step.async<T>((next, die) => {
    if (predicate()) {
      // Must use a setTimeout here otherwise FontSizeTest gets 'too much recursion' on Firefox
      setTimeout(() => {
        next();
      });
      return;
    }
    let counter = 0;
    const timer = setInterval(() => {
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

export {
  sequence,
  repeatUntil,
  waitForPredicate,
  repeat,
  sequenceRepeat
};
