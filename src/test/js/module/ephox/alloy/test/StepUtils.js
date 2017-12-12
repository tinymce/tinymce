import { Assertions } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { Step } from '@ephox/agar';

var sAssertFailIs = function (label, expected, f) {
  return Step.control(
    Step.sync(function () {
      var passed = false;
      try {
        f();
        passed = true;

      } catch (err) {
        Assertions.assertEq('Checking exist error match', expected, err.message);
      }

      if (passed) throw new Error('Expected error: ' + expected + ' was not thrown');
    }),
    Guard.addLogging(label)
  );
};

var sAssertFailContains = function (label, expected, f) {
  return Step.control(
    Step.sync(function () {
      var passed = false;
      try {
        f();
        passed = true;
      } catch (err) {
        Assertions.assertEq('Checking err message contains: ' + expected, true, err.message.indexOf(expected) > -1);
      }

      if (passed) throw new Error('Expected error: ' + expected + ' was not thrown');
    }),
    Guard.addLogging(label)
  );
};

export default <any> {
  sAssertFailIs: sAssertFailIs,
  sAssertFailContains: sAssertFailContains
};