asynctest(
  'LazyValueTest',
 
  [
    'ephox.katamari.api.LazyValue',
    'global!Promise'
  ],
 
  function (LazyValue, Promise) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
 
    var testGet = function () {
      return new Promise(function (resolve, reject) {
        var lazyval = LazyValue.nu(function () {

         
        })
      });
    };

    var testMap = function () {
      return new Promise(function (resolve, reject) {

      });
    };

    var testIsReady = function () {
      return new Promise(function (resolve, reject) {

      });
    };

    var testPure = function () {
      return new Promise(function (resolve, reject) {

      });
    };

  }
);