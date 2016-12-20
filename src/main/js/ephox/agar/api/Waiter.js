define(
  'ephox.agar.api.Waiter',

  [
    'ephox.agar.api.Guard',
    'ephox.agar.api.Step',
    'global!Error',
    'global!setTimeout'
  ],

  function (Guard, Step, Error, setTimeout) {
    var sTryUntil = function (label, step, interval, amount) {
      var guard = Guard.tryUntil(label, interval, amount);
      return Step.control(step, guard);      
    };

    var sTryUntilNot = function (label, step, interval, amount) {
      var guard = Guard.tryUntilNot(label, interval, amount);
      return Step.control(step, guard);
    };

    var sTimeout = function (label, step, limit) {
      var guard = Guard.timeout(label, limit);
      return Step.control(step, guard);
    };

    return {
      sTryUntil: sTryUntil,
      sTryUntilNot: sTryUntilNot,
      sTimeout: sTimeout
    };
  }
);