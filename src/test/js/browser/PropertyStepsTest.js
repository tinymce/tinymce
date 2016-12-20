asynctest(
  'PropertyStepsTest',
 
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.PropertySteps',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.wrap-jsverify.Jsc'
  ],
 
  function (Pipeline, PropertySteps, RawAssertions, Step, Jsc) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    // NOTE: Make this fail to test output errors.
    Pipeline.async({}, [
      PropertySteps.sAsyncProperty(
        'Check number dividing by 1 is itself',
        [ Jsc.integer ],
        Step.stateful(function (num, next, die) {
          RawAssertions.assertEq('x / 1 === x', num, num / 1);
          next(num);
        }),
        { }
      )
    ], function () { success(); }, failure);
 

  }
);