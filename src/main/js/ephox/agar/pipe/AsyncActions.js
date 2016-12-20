define(
  'ephox.agar.pipe.AsyncActions',

  [
    'global!setTimeout'
  ],

  function (setTimeout) {
    var delay = function (amount) {
      return function (next, die) {
        setTimeout(function () {
          next();
        }, amount);
      };
    };

    // Not really async, but can fail.
    var fail = function (message) {
      return function (next, die) {
        die('Fake failure: ' + message);
      };
    };

    return {
      delay: delay,
      fail: fail
    };
  }
);