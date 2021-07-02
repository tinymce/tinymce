import { Assert } from '@ephox/bedrock-client';
import { Pprint } from '@ephox/dispute';
import { Arr, Fun, Result } from '@ephox/katamari';

import { Chain } from 'ephox/agar/api/Chain';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';

const sPreserved = '..preserved..';

// We expect it to fail, and we are checking that the error is the right one
const assertError = (label: string, expectedError: any, actualError: any): Result<any, Error> => {
  const errMessage = actualError.message !== undefined ? actualError.message : actualError;
  try {
    Assert.eq(
      label + ': checking error message: ' + errMessage + '\n contains: ' + expectedError + '\nActual error: \n' + Pprint.render(actualError, Pprint.pprintAny),
      true,
      errMessage.indexOf(expectedError) > -1
    );
    return Result.value(actualError);
  } catch (err) {
    return Result.error(err);
  }
};

const assertPprintError = <T>(label: string, expectedExpectedValue: T, expectedActualValue: T, actualError: any): Result<T, Error> => {
  try {
    Assert.eq('checking expected diff of error', actualError.diff, {
      actual: expectedActualValue,
      expected: expectedExpectedValue
    });
    return Result.value(actualError);
  } catch (err) {
    return Result.error(err);
  }
};

// We expect it to fail, and we somehow succeeded
const failOnSuccess = (label: string, expectedError: any, unexpectedSuccess: any): string => label + ': Should not have passed. Expected error: ' + expectedError + '. ' +
    'Received success: ' + unexpectedSuccess;

// We expect it to pass, so we are checking that the passing value is the right one
const assertSuccess = <T>(label: string, expected: T, actual: T): Result<T, Error> => {
  try {
    Assert.eq(label + ': checking successful value', expected, actual);
    return Result.value(actual);
  } catch (err) {
    return Result.error(err);
  }
};

// We expect it to pass, but we received an unexpected failure
const failOnError = (label: string, expectedSuccess: any, unexpectedError: any): string => {
  const errMessage = unexpectedError.message !== undefined ? unexpectedError.message : unexpectedError;
  return label + '\nExpected success: ' + expectedSuccess + '.\nInstead, failed: ' + errMessage;
};

const failed = <T>(label: string, expected: T, step: Step<T, T>): Step<T, T> =>
  Step.raw((value, next, die, initLogs) => {
    step.runStep(value, (v, newLogs) => {
      const msg = failOnSuccess(label, expected, v);
      die(msg, newLogs);
    }, (err, newLogs) => {
      assertError(label, expected, err).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs)
      );
    }, initLogs);
  });

const passed = <T>(label: string, expected: T | string, step: Step<T, T>): Step<T, T> =>
  Step.raw((value, next, die, initLogs) => {
    step.runStep(value, (v, newLogs) => {
      const exp = expected === sPreserved ? value : expected;
      assertSuccess(label, exp, v).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs)
      );
    }, (err, newLogs) => {
      const msg = failOnError(label, expected, err);
      die(msg, newLogs);
    }, initLogs);
  });

const testStepsPass = <T>(expected: T, steps: Array<Step<any, any>>): Step<any, any> =>
  Step.raw((v, next, die, initLogs) => Pipeline.async(v, steps, (v2, newLogs) => {
    assertSuccess('Checking final step value', expected, v2).fold(
      (err) => die(err, newLogs),
      (_) => {
        next(_, newLogs);
      }
    );
  }, (err, newLogs) => {
    const msg = failOnError('testStepsPass', expected, err);
    die(msg, newLogs);
  }, initLogs));

const testStepsFail = <E>(expected: E, steps: Array<Step<any, any>>): Step<any, any> =>
  Step.raw((initValue, next, die, initLogs) => Pipeline.async(initValue, steps, (v, newLogs) => {
    const msg = failOnSuccess('testStepsFail', expected, v);
    die(msg, newLogs);
  }, (err, newLogs) => {
    assertError('testStepsFail (pipeline die)', expected, err).fold(
      (err) => die(err, newLogs),
      () => next(initValue, newLogs)
    );
  }, initLogs));

const testStepFail = <T, E>(expected: E, step: Step<T, any>): Step<T, T> =>
  Step.raw((value, next, die, initLogs) => {
    step.runStep(value, (v, newLogs) => {
      const msg = failOnSuccess('testStepFail', expected, v);
      die(msg, newLogs);
    }, (err, newLogs) => {
      assertError('testStepFail', expected, err).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs));
    }, initLogs);
  });

const testStepFailPprintError = <E, T>(expectedExpectedValue: E, expectedActualValue: E, step: Step<T, T>): Step<T, T> =>
  Step.raw((value, next, die, initLogs) => {
    step.runStep(value, (v, newLogs) => {
      const msg = failOnSuccess('testStepFail', expectedExpectedValue, v);
      die(msg, newLogs);
    }, (err, newLogs) => {
      assertPprintError('testStepFail', expectedExpectedValue, expectedActualValue, err).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs));
    }, initLogs);
  });

const testChain = <T>(expected: T, chain: Chain<T, T>): Step<T, T> =>
  Step.raw((value, next, die, initLogs) => {
    chain.runChain(value, (actual, newLogs) => {
      assertSuccess('testChain', expected, actual).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs)
      );
    }, (err, newLogs) => {
      const msg = failOnError('testChain', expected, err);
      die(msg, newLogs);
    }, initLogs);
  });

const testChainFail = <T, E>(expected: E, initial: T, chain: Chain<any, any>): Step<T, any> =>
  Step.raw((initValue, next, die, initLogs) => {
    chain.runChain(
      initial,
      (actual, newLogs) => {
        const msg = failOnSuccess('testChainFail', expected, actual);
        die(msg, newLogs);
      },
      (err, newLogs) => {
        assertError('testChainFail', expected, err).fold(
          (err) => die(err, newLogs),
          (_) => next(initValue, newLogs)
        );
      },
      initLogs
    );
  });

const testChainsFail = <T, E>(expected: E, initial: T, chains: Array<Chain<any, any>>): Step<T, any> =>
  Step.raw((initValue, next, die, initLogs) => {
    Chain.pipeline(
      Arr.flatten([
        [ Chain.inject(initial) ],
        chains
      ]),
      (v, newLogs) => {
        const msg = failOnSuccess('testChainsFail', expected, v);
        die(msg, newLogs);
      },
      (err, newLogs) => {
        assertError('testChainsFail', expected, err).fold(
          (err) => die(err, newLogs),
          (_) => next(initValue, newLogs)
        );
      },
      initLogs
    );
  });

const preserved = Fun.constant(sPreserved);

export {
  failed,
  passed,
  preserved,

  testStepFail,
  testStepFailPprintError,
  testStepsFail,
  testStepsPass,
  testChain,
  testChainFail,
  testChainsFail
};
