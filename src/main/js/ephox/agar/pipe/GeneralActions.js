define(
  'ephox.agar.pipe.GeneralActions',

  [
    'global!console'
  ],

  function (console) {
    var log = function (message) {
      return function () {
        console.log(message);
      };
    };

    var debug = function () {
      debugger;
    };

    var pass = function () { };

    return {
      log: log,
      debug: debug,
      pass: pass
    };
  }
);