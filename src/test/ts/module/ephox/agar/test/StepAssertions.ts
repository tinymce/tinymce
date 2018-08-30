import { assert } from '@ephox/bedrock';
import { Arr, Fun, Result } from '@ephox/katamari';
import { Chain } from 'ephox/agar/api/Chain';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as RawAssertions from 'ephox/agar/api/RawAssertions';
import { Step } from 'ephox/agar/api/Step';

const preserved = '..preserved..';

// We expect it to fail, and we are checking that the error is the right one
const assertError = (label: string, expectedError: any, actualError: any): Result<any,any> => {
  const errMessage = actualError.message !== undefined ? actualError.message : actualError;
  try {
    RawAssertions.assertEq(
      label + ': checking error message: ' + errMessage + ' contains: ' + expectedError,
      true,
      errMessage.indexOf(expectedError) > -1
    );
    return Result.value(actualError);
  } catch (err) {
    return Result.error(err);
  }
};

// We expect it to fail, and we somehow succeeded
const failOnSuccess = (label: string, expectedError: any, unexpectedSuccess: any): string => {
  return label + ': Should not have passed. Expected error: ' + expectedError + '. ' + 
    'Received success: ' + unexpectedSuccess;
};

// We expect it to pass, so we are checking that the passing value is the right one
const assertSuccess = (label: string, expected: any, actual: any): Result<any,any> => {
  try {
    RawAssertions.assertEq(label + ': checking successful value', expected, actual);
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

const failed = function (label, expected, step) {
  return Step.stateful(function (value, next, die) {
    step(value, function (v) {
      const msg = failOnSuccess(label, expected, v);
      die(msg);
    }, function (err) {
      assertError(label, expected, err).fold(die, () => next(value));
    });
  });
};

const passed = function (label, expected, step) {
  return Step.stateful(function (value, next, die) {
    step(value, function (v) {
      const exp = expected === preserved ? value : expected;
      assertSuccess(label, exp, v).fold(die, () => next(value));
    }, function (err) {
      const msg = failOnError(label, expected, err);
      die(msg);
    });
  });
};

const testStepsPass = function (expected, steps) {
  return Step.async(function (next, die) {
    return Pipeline.async({}, steps, function (v) {
      assertSuccess('Checking final step value', expected, v).fold(die, () => next());
    }, function (err) {
      const msg = failOnError('testStepsPass', expected, err);
      die(msg);
    });
  });
};

const testStepsFail = function (expected, steps) {
  return Step.async(function (next, die) {
    return Pipeline.async({}, steps, function (v) {
      const msg = failOnSuccess('testStepsFail', expected, v);
      die(msg);
    }, function (err) {
      assertError('testStepsFail (pipeline die)', expected, err).fold(die, () => next());
    });
  });
};

const testStepFail = function (expected, step) {
  return Step.stateful(function (value, next, die) {
    step(value, function (v) {
      const msg = failOnSuccess('testStepFail', expected, v);
      die(msg);
    }, function (err) {
      assertError('testStepFail', expected, err).fold(die, () => next(value));
    });
  });
};

const testChain = function (expected, chain) {
  return Step.stateful(function (value,next, die) {
    chain.runChain(Chain.wrap({}), function (actual) {
      assertSuccess('testChain', expected, actual.chain).fold(die, () => next(value));
    }, function (err) {
      const msg = failOnError('testChain', expected, err);
      die(msg);
    });
  });
};

const testChainFail = function (expected, initial, chain) {
  return Step.async(function (next, die) {
    chain.runChain(
      Chain.wrap(initial),
      function (actual) {
        const msg = failOnSuccess('testChainFail', expected, actual.chain)
        die(msg);
      },
      (err) => {
        assertError('testChainFail', expected, err).fold(die, () => next());
      }
    )
  });
};

const testChainsFail = (expected, initial, chains) => {
  return Step.async((next, die) => {
    Chain.pipeline(
      Arr.flatten([
        [Chain.inject(initial)],
        chains
      ]),
      (v) => {
        const msg = failOnSuccess('testChainsFail', expected, v);
        die(msg);
      },
      (err) => {
        assertError('testChainsFail', expected, err).fold(die, () => next());
      }
    );
  });
};

export default <any>{
  failed,
  passed,
  preserved: Fun.constant(preserved),

  testStepFail,
  testStepsFail,
  testStepsPass,
  testChain,
  testChainFail,
  testChainsFail
};