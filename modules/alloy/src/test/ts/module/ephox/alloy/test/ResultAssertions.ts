import { RawAssertions } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { assert } from '@ephox/bedrock';

/* global assert */
const errsToString = (err) => {
  return Arr.map(err, (e) => {
    return e.message !== undefined ? e.message : e;
  }).join('');
};

const checkErr = (label, expectedPart, f) => {
  const actual = f();
  actual.fold((err) => {
    const errMessage = errsToString(err);
    // Not using message when coming from getOrDie
    RawAssertions.assertEq(
      label + '\nExpecting to contain("' + expectedPart + '")\nActual: ' + errMessage,
      true,
      errMessage.indexOf(expectedPart) > -1
    );
  }, (val) => {
    assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
  });
};

const checkErrStr = (label, expectedPart, f) => {
  const actual = f();
  actual.fold((err) => {
    // Not using message when coming from getOrDie
    RawAssertions.assertEq(
      label + '\nExpecting to contain("' + expectedPart + '")\nActual: ' + err,
      true,
      err.indexOf(expectedPart) > -1
    );
  }, (val) => {
    assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
  });
};

const checkVal = (label, f, assertValue) => {
  const actual = f();
  actual.fold((err) => {
    assert.fail('Unexpected error: ' + errsToString(err));
  }, (value) => {
    assertValue(value);
  });
};

export {
  checkErr,
  checkErrStr,
  checkVal
};