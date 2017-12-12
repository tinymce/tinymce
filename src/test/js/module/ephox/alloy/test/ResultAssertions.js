import { RawAssertions } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { assert } from '@ephox/refute';

/* global assert */
var errsToString = function (err) {
  return Arr.map(err, function (e) {
    return e.message !== undefined ? e.message : e;
  }).join('');
};

var checkErr = function (label, expectedPart, f) {
  var actual = f();
  actual.fold(function (err) {
    var errMessage = errsToString(err);
    // Not using message when coming from getOrDie
    RawAssertions.assertEq(
      label + '\nExpecting to contain("' + expectedPart + '")\nActual: ' + errMessage,
      true,
      errMessage.indexOf(expectedPart) > -1
    );
  }, function (val) {
    assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
  });
};

var checkErrStr = function (label, expectedPart, f) {
  var actual = f();
  actual.fold(function (err) {
    // Not using message when coming from getOrDie
    RawAssertions.assertEq(
      label + '\nExpecting to contain("' + expectedPart + '")\nActual: ' + err,
      true,
      err.indexOf(expectedPart) > -1
    );
  }, function (val) {
    assert.fail('Expected error containing("' + expectedPart + '") was not thrown');
  });
};

var checkVal = function (label, f, assertValue) {
  var actual = f();
  actual.fold(function (err) {
    assert.fail('Unexpected error: ' + errsToString(err));
  }, function (value) {
    assertValue(value);
  });
};

export default <any> {
  checkErr: checkErr,
  checkErrStr: checkErrStr,
  checkVal: checkVal
};