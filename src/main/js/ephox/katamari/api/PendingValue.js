define(
  'ephox.katamari.api.PendingValue',

  [
    'ephox.katamari.api.Arr',
    'global!Array',
    'global!setTimeout'
  ],

  function (Arr, Array, setTimeout) {
    return function () {
      var data = null;
      var callbacks = [];

      var onReady = function (callback) {
        if (isAvailable()) call(callback);
        else callbacks.push(callback);
      };

      var set = function (/* data */) {
        data = Array.prototype.slice.call(arguments);
        run();
        callbacks = [];
      };

      var isAvailable = function () {
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
        onReady: onReady,
        set: set,
        isAvailable: isAvailable
      };
    };
  }
);