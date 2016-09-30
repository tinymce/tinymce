define(
  'ephox.robin.util.Trampoline',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    // This is used to avoid stack problems.
    // Explanation: http://stackoverflow.com/questions/25228871/how-to-understand-trampoline-in-javascript
    var run = function (fn) {
      var f = fn;
      while (f !== stop) {
        f = f();
      }
    };

    var stop = undefined;

    return {
      stop: Fun.constant(stop),
      run: run
    };
  }
);