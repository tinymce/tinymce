import RawAssertions from 'ephox/agar/api/RawAssertions';
import UnitTest from 'ephox/agar/api/UnitTest';
import { Adt } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Future } from '@ephox/katamari';
import { Global } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('UnitTestTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var testResult = Adt.generate([
    { pass: [ 'name' ] },
    { fail: [ 'name', 'error' ] }
  ]);

  var oldTests = Global.__tests;
  Global.__tests = [];

  UnitTest.test('test1 pass', function () {
    RawAssertions.assertEq('label', true, true);
  });

  UnitTest.test('test2 fail', function () {
    RawAssertions.assertEq('label', true, false);
  });

  UnitTest.test('test3 fail', function () {
    throw new Error('fail');
  });

  UnitTest.asynctest('test4 async fail', function (success, failure) {
    failure(new Error('Failed async test'));
  });

  UnitTest.asynctest('test5 async pass', function (success, failure) {
    success();
  });

  UnitTest.asynctest('test6 async fail', function (success, failure) {
    throw new Error('fail');
  });

  UnitTest.domtest('test7 domtest fail', function () {
    return new Promise(function (resolve, reject) {
      reject(new Error('Failed dom test'));
    });
  });

  UnitTest.domtest('test8 domtest pass', function () {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  });

  var testToFuture = function (test) {
    return Future.nu(function (callback) {
      try {
        test.test(function () {
          callback(testResult.pass(test.name));
        }, function (err) {
          callback(testResult.fail(test.name, err.message));
        });
      } catch (ex) {
        callback(testResult.fail(test.name, ex.message));
      }
    });
  };

  var seq = function (futures) {
    var next = function (futures, results, callback) {
      if (futures.length > 0) {
        futures.shift().get(function (result) {
          results.push(result);
          next(futures, results, callback);
        });
      } else {
        callback(results);
      }
    };

    return Future.nu(function (callback) {
      var results = [];
      next(futures.concat([]), results, callback);
    });
  };

  var runTests = function () {
    return seq(Arr.map(Global.__tests, testToFuture));
  };

  runTests().get(function (results) {
    var resultJson = Arr.map(results, function (result) {
      return result.fold(
        function(name) {
          return { name: name, result: 'pass' };
        },
        function(name, err) {
          return { name: name, result: err };
        }
      );
    });

    try {
      RawAssertions.assertEq('Should be expected test result', [
        {
          "name": "test1 pass",
          "result": "pass"
        },
        {
          "name": "test2 fail",
          "result": "label.\n  Expected: true\n  Actual: false"
        },
        {
          "name": "test3 fail",
          "result": "fail"
        },
        {
          "name": "test4 async fail",
          "result": "Failed async test"
        },
        {
          "name": "test5 async pass",
          "result": "pass"
        },
        {
          "name": "test6 async fail",
          "result": "fail"
        },
        {
          "name": "test7 domtest fail",
          "result": "Failed dom test"
        },
        {
          "name": "test8 domtest pass",
          "result": "pass"
        }
      ], resultJson);

      Global.__tests = oldTests;
      success();
    } catch (ex) {
      failure(ex);
    }
  });
});

