import { Assertions, Guard, Step } from '@ephox/agar';

const sAssertFailIs = function (label, expected, f) {
  return Step.control(
    Step.sync(function () {
      let passed = false;
      try {
        f();
        passed = true;

      } catch (err) {
        Assertions.assertEq('Checking exist error match', expected, err.message);
      }

      if (passed) { throw new Error('Expected error: ' + expected + ' was not thrown'); }
    }),
    Guard.addLogging(label)
  );
};

const sAssertFailContains = function (label, expected, f) {
  return Step.control(
    Step.sync(function () {
      let passed = false;
      try {
        f();
        passed = true;
      } catch (err) {
        Assertions.assertEq('Checking err message contains: ' + expected, true, err.message.indexOf(expected) > -1);
      }

      if (passed) { throw new Error('Expected error: ' + expected + ' was not thrown'); }
    }),
    Guard.addLogging(label)
  );
};

export default <any> {
  sAssertFailIs,
  sAssertFailContains
};