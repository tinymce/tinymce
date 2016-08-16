define(
  'ephox.katamari.api.Throttler',

  [
    'global!setTimeout'
  ],

  function (setTimeout) {
    // FIX: Let's change this API and maybe introduce 
    // a set timeout here also
    return function (fn, rate) {
      var timer = null;
      var args = null;
      var throttle = function () {
        args = arguments;
        if (timer === null) {
          timer = setTimeout(function () {
            fn.apply(null, args);
            timer = null;
            args = null;
          }, rate);
        }
      };

      return {
        throttle: throttle
      };
    };
  }
);