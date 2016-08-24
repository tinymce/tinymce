asynctest(
  'LazyValueTest',
 
  [
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.test.AsyncProps',
    'global!Promise'
  ],
 
  function (LazyValue, AsyncProps, Promise) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
 
    var testGet = function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    };

    var testMap = function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    };

    var testIsReady = function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    };

    var testPure = function () {
      return new Promise(function (resolve, reject) {
        resolve(true);
      });
    };

    var testSpecs = function () {
      return AsyncProps.checkProps([ ]);
    };

    return testGet().then(testMap).then(testIsReady).then(testPure).then(testSpecs).then(function () {
      success();
    }, failure);
  }
);