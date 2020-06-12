import { console } from '@ephox/dom-globals';
import { Arr, Type } from '@ephox/katamari';

import { DieFn, NextFn } from '../pipe/Pipe';
import { Step } from './Step';
import { TestLogs } from './TestLogs';

const assertSteps = (steps: Step<any, any>[]) => {
  Arr.each(steps, (s: Step<any, any>, i: number) => {
    let msg: string;
    if (s === undefined) {
      msg = 'step ' + i + ' was undefined. All steps: ' + JSON.stringify(steps) + '\n';
    } else if (Type.isArray(s)) {
      msg = 'step ' + i + ' was an array';
    }

    if (msg !== undefined) {
      // tslint:disable-next-line:no-console
      console.trace(msg, steps);
      throw new Error(msg);
    }
  });
};

/**
 * Execute a Step, supplying default logs.
 *
 * If you need to run a sequence of steps, compose them using the functions in StepSequence
 */
const runStep = <T, U> (initial: T, step: Step<T, U>, onSuccess: NextFn<U>, onFailure: DieFn, initLogs?: TestLogs): void => {
  step.runStep(initial, onSuccess, onFailure, TestLogs.getOrInit(initLogs));
};

const async = (initial: any, steps: Step<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs?: TestLogs): void => {
  assertSteps(steps);

  const chain = (lastLink: any, logs: TestLogs, index: number) => {
    if (index < steps.length) {
      const asyncOperation = steps[index];
      // FIX: Make this test elsewhere without creating a circular dependency on Chain
      if ('runChain' in asyncOperation) {
        return onFailure('You cannot create a pipeline out of chains. Use Chain.asStep to turns chains into steps', logs);
      }
      try {
        const nextStep = (result, newLogs) => {
          chain(result, newLogs, index + 1);
        };

        asyncOperation.runStep(lastLink, (x, newLogs) => {
          nextStep(x, newLogs);
        }, onFailure, logs);
      } catch (error) {
        onFailure(error, logs);
      }
    } else {
      const finalLogs = logs;
      onSuccess(lastLink, finalLogs);
    }
  };

  const startLogs = TestLogs.getOrInit(initLogs);
  chain(initial, startLogs, 0);
};

export const Pipeline = {
  async,
  runStep
};
