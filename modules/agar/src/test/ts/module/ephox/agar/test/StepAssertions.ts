import { Arr, Fun, Result } from '@ephox/katamari';
import { Chain } from 'ephox/agar/api/Chain';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as RawAssertions from 'ephox/agar/api/RawAssertions';
import { Step } from 'ephox/agar/api/Step';

const preserved = '..preserved..';

// We expect it to fail, and we are checking that the error is the right one
const assertError = (label: string, expectedError: any, actualError: any): Result<any, any> => {
  const errMessage = actualError.message !== undefined ? actualError.message : actualError;
  try {
    RawAssertions.assertEq(
      label + ': checking error message: ' + errMessage + '\n contains: ' + expectedError,
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
const assertSuccess = (label: string, expected: any, actual: any): Result<any, any> => {
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

const failed = function (label, expected, step: Step<any, any>) {
  return Step.raw(function (value, next, die, initLogs) {
    step(value, function (v, newLogs) {
      const msg = failOnSuccess(label, expected, v);
      die(msg, newLogs);
    }, function (err, newLogs) {
      assertError(label, expected, err).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs)
      );
    }, initLogs);
  });
};

const passed = function (label, expected, step: Step<any, any>) {
  return Step.raw((value, next, die, initLogs) => {
    step(value, function (v, newLogs) {
      const exp = expected === preserved ? value : expected;
      assertSuccess(label, exp, v).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs)
      );
    }, function (err, newLogs) {
      const msg = failOnError(label, expected, err);
      die(msg, newLogs);
    }, initLogs);
  });
};

const testStepsPass = function (expected, steps: Array<Step<any, any>>) {
  return Step.raw(function (v, next, die, initLogs) {
    return Pipeline.async(v, steps, function (v2, newLogs) {
      assertSuccess('Checking final step value', expected, v2).fold(
        (err) => die(err, newLogs),
        (_) => {
          next(_, newLogs);
        }
      );
    }, function (err, newLogs) {
      const msg = failOnError('testStepsPass', expected, err);
      die(msg, newLogs);
    }, initLogs);
  });
};

const testStepsFail = function (expected, steps: Array<Step<any, any>>) {
  return Step.raw(function (initValue, next, die, initLogs) {
    return Pipeline.async(initValue, steps, function (v, newLogs) {
      const msg = failOnSuccess('testStepsFail', expected, v);
      die(msg, newLogs);
    }, function (err, newLogs) {
      assertError('testStepsFail (pipeline die)', expected, err).fold(
        (err) => die(err, newLogs),
        () => next(initValue, newLogs)
      );
    }, initLogs);
  });
};

const testStepFail = function (expected, step: Step<any, any>) {
  return Step.raw(function (value, next, die, initLogs) {
    step(value, function (v, newLogs) {
      const msg = failOnSuccess('testStepFail', expected, v);
      die(msg, newLogs);
    }, function (err, newLogs) {
      assertError('testStepFail', expected, err).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs));
    }, initLogs);
  });
};

const testChain = function (expected, chain: Chain<any, any>) {
  return Step.raw(function (value, next, die, initLogs) {
    chain.runChain(Chain.wrap(value), function (actual, newLogs) {
      assertSuccess('testChain', expected, actual.chain).fold(
        (err) => die(err, newLogs),
        (_) => next(value, newLogs)
      );
    }, function (err, newLogs) {
      const msg = failOnError('testChain', expected, err);
      die(msg, newLogs);
    }, initLogs);
  });
};

const testChainFail = function (expected, initial, chain: Chain<any, any>) {
  return Step.raw(function (initValue, next, die, initLogs) {
    chain.runChain(
      Chain.wrap(initial),
      function (actual, newLogs) {
        const msg = failOnSuccess('testChainFail', expected, actual.chain);
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
};

const testChainsFail = (expected, initial, chains: Array<Chain<any, any>>) => {
  return Step.raw((initValue, next, die, initLogs) => {
    Chain.pipeline(
      Arr.flatten([
        [Chain.inject(initial)],
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
};

export default {
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
