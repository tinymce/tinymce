import { console } from '@ephox/dom-globals';
import { Thunk } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import { Step } from '../api/Step';
import { TestLogs } from '../api/TestLogs';

const logNoPromises = Thunk.cached(function () {
  console.warn('No native promise support on browser to run async property tests. Skipping!');
});

const fakePromise = function (): PromiseLike<true> {
  const self = {
    then: function (fs: (result: any) => void) {
      logNoPromises();
      fs(true);
      return self;
    }
  };

  return self;
};

const stepToPromise = function <T, U>(step: Step<T, U>) {
  return function (input: T): PromiseLike<true> {
    return typeof Promise !== "undefined" ? new Promise<true>(function (resolve, reject) {
      step(input, function () {
        resolve(true);
      // Not sure what to do about logging for this.
      }, reject, TestLogs.init());
    }) : fakePromise();
  };
};

// Maybe wrap in the same way Jsc does for console output with ticks and crosses.
const sAsyncProperty = function <T, X, Y>(name: string, arbitraries, statefulStep: Step<X, Y>, _options?) {
  const options = _options !== undefined ? _options : {};

  return Step.async<T>(function (next, die) {
    Jsc.asyncProperty(
      name,
      arbitraries,
      stepToPromise(statefulStep),
      options
    ).then(next, die);
  });
};

export {
  sAsyncProperty
};