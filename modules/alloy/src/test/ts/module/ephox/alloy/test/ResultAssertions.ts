import { Arr } from '@ephox/katamari';
import { Assert, assert } from '@ephox/bedrock-client';

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
    Assert.eq(
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
    Assert.eq(
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
