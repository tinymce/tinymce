asynctest(
  'LazyValueTest',
 
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.api.LazyValues',
    'ephox.katamari.api.Result',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!setTimeout'
  ],
 
  function (Fun, LazyValue, LazyValues, Result, AsyncProps, Jsc, Promise, setTimeout) {
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
          if (! Jsc.eq(val, 1)) reject('LazyValue.get. The counter should be 1 after 1 call');
          else lazy.get(function (val2) {
            if (Jsc.eq(val2, 1)) resolve(true);
            else reject('LazyValue.get. The counter should still be 1 because it is cached. Was: ' + val2);
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

        if (lazy.isReady()) reject('LazyValue.isReady. Lazy value should not be ready yet.');
        else lazy.get(function (v) {
          if (! lazy.isReady()) reject('LazyValue.isReady. Lazy value should now be ready');
          else resolve(true);
        });
      });
    };

    var testPure = function () {
      return new Promise(function (resolve, reject) {
        LazyValue.pure(10).get(function (v) {
          return Jsc.eq(10, v) ? resolve(true) : reject('LazyValue.pure. Expected 10, was: ' + v);
        });
      });
    };

    var testParallel = function () {
      return new Promise(function (resolve, reject) {
        var f = LazyValue.nu(function(callback) {
          setTimeout(Fun.curry(callback, 'apple'), 10);
        });
        var g = LazyValue.nu(function(callback) {
          setTimeout(Fun.curry(callback, 'banana'), 5);
        });
        var h = LazyValue.nu(function(callback) {
          callback('carrot');
        });


        LazyValues.par([f, g, h]).get(function(r){
          assert.eq(r[0], 'apple');
          assert.eq(r[1], 'banana');
          assert.eq(r[2], 'carrot');
          resolve(true);
        });
      });
    };

    var testSpecs = function () {
      return AsyncProps.checkProps([
        {
          label: 'LazyValue.pure resolves with data',
          arbs: [ Jsc.json ],
          f: function (json) {
            return AsyncProps.checkLazy(LazyValue.pure(json), function (data) {
              return Jsc.eq(json, data) ? Result.value(true) : Result.error('Payload is not the same');
            });
          }
        },

        {
          label: 'LazyValue.pure map f resolves with f data',
          arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
          f: function (json, f) {
            return AsyncProps.checkLazy(LazyValue.pure(json).map(f), function (data) {
              return Jsc.eq(f(json), data) ? Result.value(true) : Result.error('f(json) !== data');
            });
          }
        }
      ]);
    };

    return testGet().then(testMap).then(testIsReady).then(testPure).then(testParallel).
      then(testSpecs).then(function () {
      success();
    }, failure);
  }
);