asynctest(
  'LazyValueTest',
 
  [
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise'
  ],
 
  function (LazyValue, AsyncProps, Jsc, Promise) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var lazyCounter = function () {
      var counter = 0;
      return LazyValue.nu(function (callback) {
        counter++;
        callback(counter);
      });
    };
 
    var testGet = function () {
      return new Promise(function (resolve, reject) {
        var lazy = lazyCounter();

        lazy.get(function (val) {
          if (! Jsc.eq(val, 1)) reject('The counter should be 1 after 1 call');
          else lazy.get(function (val2) {
            if (Jsc.eq(val2, 1)) resolve(true);
            else reject('The counter should still be 1 because it is cached. Was: ' + val2);
          });
        });
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