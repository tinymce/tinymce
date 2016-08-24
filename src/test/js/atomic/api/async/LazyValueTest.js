asynctest(
  'LazyValueTest',
 
  [
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!setTimeout'
  ],
 
  function (LazyValue, AsyncProps, Jsc, Promise, setTimeout) {
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
        var f = function (x) {
          return x + 'hello';
        };

        var lazy = LazyValue.nu(function (callback) {
          setTimeout(function () {
            callback('extra');
          }, 10);
        });

        lazy.map(f).get(function (fx) {
          return Jsc.eq(fx, 'extrahello') ? resolve(true) : reject('LazyValue.map. Expected: extrahello, was: ' + fx);
        });
      });
    };

    var testIsReady = function () {
      return new Promise(function (resolve, reject) {
        var lazy = LazyValue.nu(function (callback) {
          setTimeout(function () {
            callback('extra');
          }, 100);
        });

        if (lazy.isReady()) reject('Lazy value should not be ready yet.');
        else lazy.get(function (v) {
          if (! lazy.isReady()) reject('Lazy value should now be ready');
          else resolve(true);
        });
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