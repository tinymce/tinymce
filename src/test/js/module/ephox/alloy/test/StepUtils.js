define(
  'ephox.alloy.test.StepUtils',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Step',
    'global!Error'
  ],

  function (Assertions, Guard, Step, Error) {
    var sAssertFailIs = function (label, expected, f) {
      return Step.control(
        Step.sync(function () {
          try {
            f();
            throw new Error('Expected error: ' + expected + ' was not thrown');
          } catch (err) {
            Assertions.assertEq('Checking exist error match', expected, err.message);
          }
        }),
        Guard.addLogging(label)
      );
    };

    var sAssertFailContains = function (label, expected, f) {
      return Step.control(
        Step.sync(function () {
          try {
            f();
            throw new Error('Expected error: ' + expected + ' was not thrown');
          } catch (err) {
            Assertions.assertEq('Checking err message contains: ' + expected, true, err.message.indexOf(expected) > -1);
          }
        }),
        Guard.addLogging(label)
      );
    };

    return {
      sAssertFailIs: sAssertFailIs,
      sAssertFailContains: sAssertFailContains
    };
  }
);