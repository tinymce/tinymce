asynctest(
  'StepTest',
 
  [
    'ephox.agar.api.LegacyAssert',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step'
  ],
 
  function (LegacyAssert, Logger, Pipeline, Step) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    return Pipeline.async({}, [
      Logger.t(
        '[Basic API: Step.log]\n',
        Step.log('step.test.message')
      ),

      Logger.t(
        '[Basic API: Step.debugging]\n',
        Step.debugging
      ),

      Logger.t(
        '[Basic API: Step.wait]\n',
        Step.wait(1000)
      ),

      Logger.t(
        '[Basic API: Step.fail]\n',
        Step.fail('last test')
      )
    ], function () {
      LegacyAssert.fail('The last test should have failed, so the pipeline should have failed.\n' +
        'Expected: Fake failure: last test'
      );
    }, function (err) {
      var expected = '[Basic API: Step.fail]\n\nFake failure: last test';
      LegacyAssert.eq(expected, err, '\nFailure incorrect. \nExpected:\n' + expected + '\nActual: ' + err);
      success();
    });
  }
);