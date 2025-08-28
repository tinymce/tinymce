import { Assertions, Guard, Step } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';

const sAssertFailIs = <T>(label: string, expected: string, f: () => void): Step<T, T> =>
  Step.control(
    Step.sync(() => {
      Assert.throwsError('Checking exist error match', f, expected);
    }),
    Guard.addLogging(label)
  );

const sAssertFailContains = <T>(label: string, expected: string, f: () => void): Step<T, T> =>
  Step.control(
    Step.sync(() => {
      let passed = false;
      try {
        f();
        passed = true;
      } catch (err) {
        Assertions.assertEq('Checking err message contains: ' + expected, true, (err as Error).message.indexOf(expected) > -1);
      }

      if (passed) {
        throw new Error('Expected error: ' + expected + ' was not thrown');
      }
    }),
    Guard.addLogging(label)
  );

export {
  sAssertFailIs,
  sAssertFailContains
};
