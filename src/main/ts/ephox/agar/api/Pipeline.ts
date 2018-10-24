import { console, setTimeout } from '@ephox/dom-globals';
import { Arr, Type } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import { TestLogs } from '../api/TestLogs';
import { DieFn, NextFn } from '../pipe/Pipe';
import { Step } from './Main';


const assertSteps = function (steps: Step<any, any>[]) {
  Arr.each(steps, function (s: Step<any, any>, i: number) {
    let msg: string;
    if (s === undefined) msg = 'step ' + i + ' was undefined. All steps: ' + Json.stringify(steps) + '\n';
    else if (Type.isArray(s)) msg = 'step ' + i + ' was an array';

    if (msg !== undefined) {
      console.trace(msg, steps);
      throw new Error(msg);
    }
  });
};

const callAsync = function (f) {
  typeof Promise !== "undefined" ? Promise.resolve().then(f) : setTimeout(f, 0);
};

const async = function (initial: any, steps: Step<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs?: TestLogs) {
  assertSteps(steps);

  const chain = function (lastLink: any, logs: TestLogs, index: number) {
    if (index < steps.length) {
      const asyncOperation = steps[index];
      // FIX: Make this test elsewhere without creating a circular dependency on Chain
      if ('runChain' in asyncOperation) return onFailure('You cannot create a pipeline out of chains. Use Chain.asStep to turns chains into steps', logs);
      try {
        const nextStep = function (result, newLogs) {
          chain(result, newLogs, index + 1);
        };

        asyncOperation(lastLink, function (x, newLogs) {
          callAsync(function () { nextStep(x, newLogs); });
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
  async
};