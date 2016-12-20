define(
  'ephox.agar.arbitrary.PropertySteps',

  [
    'ephox.agar.api.Step',
    'ephox.sand.api.JSON',
    'ephox.wrap-jsverify.Jsc',
    'global!Promise'
  ],

  function (Step, Json, Jsc, Promise) {
    var stepToPromise = function (step) {
      return function (input) {
        return new Promise(function (resolve, reject) {
          step(input, function () {
            resolve(true);
          }, reject);
        });
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

    return {
      sAsyncProperty: sAsyncProperty
    };
  }
);