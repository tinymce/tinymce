define(
  'ephox.katamari.api.AsyncDataCache',

  [
    'ephox.katamari.api.Arr',
    'global!Array',
    'global!setTimeout'
  ],

  function (Arr, Array, setTimeout) {
    return function () {

      var data = null;
      var callbacks = [];

      var get = function (callback) {
        isSet() ? call(callback) : callbacks.push(callback);
      };

      var set = function (/* data */) {
        data = Array.prototype.slice.call(arguments);
        run();
        callbacks = [];
      };

      var isSet = function () {
        return data !== null;
      };

      var run = function () {
        Arr.each(callbacks, function (x) {
          call(x);
        });
      };

      var call = function (f) {
        setTimeout(function () {
          f.apply(null, data);
        }, 0);
      };

      return {
        get: get,
        set: set,
        isSet: isSet
      };
    };
  }
);
