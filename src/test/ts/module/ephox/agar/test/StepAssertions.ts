import Chain from 'ephox/agar/api/Chain';
import { assert } from '@ephox/refute';
import Pipeline from 'ephox/agar/api/Pipeline';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import Step from 'ephox/agar/api/Step';
import { Fun } from '@ephox/katamari';

var preserved = '..preserved..';
var failed = function (label, expected, step) {
  return Step.stateful(function (value, next, die) {
    step(value, function (v) {
      assert.fail(label + '\nExpected failure: ' + expected + '.\nInstead, succeeded with: ' + v);
    }, function (err) {
      var errMessage = err.message !== undefined ? err.message : err;
      assert.eq(expected, errMessage, label + '\nExpected: ' + expected + '\nActual: ' + errMessage);
      next(value);
    });
  });
};

var passed = function (label, expected, step) {
  return Step.stateful(function (value, next, die) {
    step(value, function (v) {
      var exp = expected === preserved ? value : expected;
      assert.eq(exp, v, label + '\nSuccess value incorrect: \nExpected: ' + exp + '\nActual: ' + v);
      next(value);
    }, function (err) {
      var errMessage = err.message !== undefined ? err.message : err;
      assert.fail(label + '\nExpected success: ' + expected + '.\nInstead, failed: ' + errMessage);
    });
  });
};

var testStepsPass = function (expected, steps) {
  return Step.async(function (next, die) {
    return Pipeline.async({}, steps, function (v) {
      RawAssertions.assertEq('Checking final step value', expected, v);
      next();
    }, function (err) {
      die(err);
    });
  });
};

var testStepsFail = function (expected, steps) {
  return Step.async(function (next, die) {
    return Pipeline.async({}, steps, function () {
      die('Should not have passed. Expected error: ' + expected);
    }, function (err) {
      var errMessage = err.message !== undefined ? err.message : err;
      // Allow there to be other information at the end.
      if (errMessage.indexOf(expected) !== 0) die('Unexpected error: ' + errMessage + '\n  Expected error: ' + expected);
      else next();
    });
  });
};

var testChain = function (expected, chain) {
  return Step.async(function (next, die) {
    chain.runChain(Chain.wrap({}), function (actual) {
      if (expected !== actual.chain) die('Unexpected chain result: [' + actual.chain + ']\n Expected: [' + expected + ']');
      else next();
    }, function (err) {
      die(err);
    });
  });
};

export default <any> {
  failed: failed,
  passed: passed,
  preserved: Fun.constant(preserved),

  testStepsFail: testStepsFail,
  testStepsPass: testStepsPass,
  testChain: testChain
};