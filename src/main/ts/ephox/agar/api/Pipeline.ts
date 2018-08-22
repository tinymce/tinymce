import { clearTimeout, console, setTimeout } from '@ephox/dom-globals';
import { Arr, Fun, Type } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import { DieFn, NextFn } from '../pipe/Pipe';
import { Step } from './Main';

const SLOW = false;
// This slows it down considerably.
const DEBUG = false;

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

interface DebugStep {
  completion: boolean;
  operation: Step<any, any>;
}

const pipeContinuity = function () {
  // When in DEBUG mode, the pipeline will throw warnings when next() has not been called after the TIMEOUT, it will also identify the step that has not called next.
  // This debug tool will work with pipes inside mixed pipes, there should only be 1 instance running at any given time, see the addPipeStep() instance
  const TIMEOUT = 8000;
  const completionStack: DebugStep[] = [];
  let completionHandle: number | null = null;

  const clear = function () {
    clearTimeout(completionHandle);
  };

  const onTimeout = function () {
    Arr.find(Arr.reverse(completionStack), function (step) {
      return step.completion === false;
    }).each(function (incomplete) {
      console.warn('[DEBUG-MODE] Test suite has not progressed after ' + TIMEOUT + 'ms.  This may be due to the current step function not calling next().  Ensure the step has next passed in and is called on completion in order to progress to the next test.');
      console.warn(incomplete.operation.toString());
    });
  };

  const timeExtension = function () {
    clear();
    completionHandle = setTimeout(onTimeout, TIMEOUT);
  };

  if (!DEBUG) {
    return function (_operation: Step<any, any>) {
      return () => { };
    };
  } else {
    return function (operation: Step<any, any>) {
      const index = completionStack.length;
      completionStack.push({
        completion: false,
        operation: operation
      });
      return function () {
        // everytime next is called, we reset the timeout
        // allowing the next step a full TIMEOUT to complete.
        timeExtension();
        completionStack[index].completion = true;
      };
    };
  }
};

const addPipeStep = pipeContinuity();

const debugPipeError = function (error: any, step: Step<any, any>) {
  if (!error.name) {
    console.error(error);
    console.error('[DEBUG-MODE] this step threw the error');
    console.warn(step.toString());
    return;
  }

  const isTypeError = error.name.toLowerCase() === "typeerror";
  const isApplyUndefinedError = error.message === "Cannot read property 'apply' of undefined";
  const stepIsFn = typeof step === 'function';
  const isCurriedStep = Fun.curry.toString().indexOf(step.toString()) > 0;

  if (stepIsFn === false) {
    console.error('[DEBUG-MODE] Each step in the Pipeline needs to be a function (..args, value, next, die), this step is of type: ' + typeof step);
  }

  if (isTypeError && isApplyUndefinedError && stepIsFn && isCurriedStep) {
    console.error('[DEBUG-MODE] It is possible that a function being curried is not defined, check Fun.curry');
  }
};

const callAsync = function (f) {
  typeof Promise !== "undefined" ? Promise.resolve().then(f) : setTimeout(f, 0);
};

const async = function (initial: any, steps: Step<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, delay_doNotUse?: number) {
  assertSteps(steps);

  const chain = function (lastLink: any, index: number) {
    if (index < steps.length) {
      const asyncOperation = steps[index];
      // FIX: Make this test elsewhere without creating a circular dependency on Chain
      if ('runChain' in asyncOperation) return onFailure('You cannot create a pipeline out of chains. Use Chain.asStep to turns chains into steps');
      const stepComplete = addPipeStep(asyncOperation);
      try {
        const nextStep = function (result) {
          chain(result, index + 1);
        };
        // Oh hai, did you forget to flatten the pipeline?
        asyncOperation(lastLink, function (x) {
          stepComplete();
          if (delay_doNotUse !== undefined) setTimeout(function () { nextStep(x); }, SLOW ? delay_doNotUse : 0);
          else callAsync(function () { nextStep(x); });
        }, onFailure);
      } catch (error) {
        if (DEBUG) debugPipeError(error, steps[index]);
        onFailure(error);
      }
    } else {
      onSuccess(lastLink);
    }
  };
  chain(initial, 0);
};

export const Pipeline = {
  async
};