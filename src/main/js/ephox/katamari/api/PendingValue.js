define(
  'ephox.katamari.api.PendingValue',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'global!Array',
    'global!setTimeout'
  ],

  function (Arr, Option, Array, setTimeout) {
    return function () {
      var data = Option.none();
      var callbacks = [];

      var onReady = function (callback) {
        if (isAvailable()) call(callback);
        else callbacks.push(callback);
      };

      var set = function (x) {
        data = Option.some(x);
        run(callbacks);
        callbacks = [];
      };

      var isAvailable = function () {
        return data.isSome();
      };

      var run = function (cbs) {
        Arr.each(cbs, call);
      };

      var call = function (cb) {
        data.each(function (x) {
          setTimeout(function () {
            cb(x);
          }, 0);
        });
      };

      return {
        onReady: onReady,
        set: set,
        isAvailable: isAvailable
      };
    };
  }
);