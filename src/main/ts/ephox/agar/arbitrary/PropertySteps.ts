import Step from '../api/Step';
import { Thunk } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

var logNoPromises = Thunk.cached(function () {
  console.warn('No native promise support on browser to run async property tests. Skipping!');
});

var fakePromise = function () {
  var self = {
    then: function (fs) {
      logNoPromises();
      fs(true);
      return self;
    }
  };

  return self;
};

var stepToPromise = function (step) {
  return function (input) {
    return typeof Promise !== "undefined" ? new Promise(function (resolve, reject) {
      step(input, function () {
        resolve(true);
      }, reject);
    }) : fakePromise();
  };
};

// Maybe wrap in the same way Jsc does for console output with ticks and crosses.
var sAsyncProperty = function (name, arbitraries, statefulStep, _options) {
  var options = _options !== undefined ? _options : { };

  return Step.async(function (next, die) {
    Jsc.asyncProperty(
      name,
      arbitraries,
      stepToPromise(statefulStep),
      options
    ).then(next, die);
  });
};

export default {
  sAsyncProperty: sAsyncProperty
};