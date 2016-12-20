define(
  'ephox.agar.api.Monitor',

  [
    'global!Array'
  ],

  function (Array) {
    return function (initial, f) {
      var value = initial;
      var run = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        value++;
        return f.apply(f, args);
      };

      var get = function () {
        return value;
      };

      var clear = function () {
        value = initial;
      };

      return {
        run: run,
        get: get,
        clear: clear
      };
    };
  }
);