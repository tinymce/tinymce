import * as fc from 'fast-check';

import { Step } from '../api/Step';
import { TestLogs } from '../api/TestLogs';

const stepToPromise = <T, U>(step: Step<T, U>) => (input: T): PromiseLike<true> =>
  new Promise<true>((resolve, reject) => {
    step.runStep(input, () => {
      resolve(true);
      // Not sure what to do about logging for this.
    }, reject, TestLogs.init());
  });

const sAsyncProperty = <T, X>(name: string, arbitraries: fc.Arbitrary<X>[], statefulStep: Step<X, any>, options?: fc.Parameters): Step<T, T> => {
  return Step.async<T>((next, die) => {
    fc.assert(fc.asyncProperty.call(fc, ...arbitraries, stepToPromise(statefulStep)), options).then(next, die);
  });
};

export {
  sAsyncProperty
};
