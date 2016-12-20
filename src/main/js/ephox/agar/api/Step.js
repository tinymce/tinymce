define(
  'ephox.agar.api.Step',

  [
    'ephox.agar.pipe.AsyncActions',
    'ephox.agar.pipe.GeneralActions',
    'ephox.agar.pipe.Pipe'
  ],

  function (AsyncActions, GeneralActions, Pipe) {
    var stateful = function (f) {
      // In the future we might want to 'hide' this like we do in chain to decrease the likelihood of accidentally using it.
      return function (state, next, die) {
        Pipe(f)(state, next, die);
      };
    };

    // Chiefly used for limiting things with timeouts.
    var control = function (step, guard) {
      return Pipe(function (value, next, die) {
        guard(step, value, next, die);
      });
    };

    var sync = function (f) {
      return Pipe(function (value, next, die) {
        f();
        next(value);
      });
    };

    var async = function (f) {
      return Pipe(function (value, next, die) {
        f(function () {
          next(value);
        }, die);
      });
    };

    // Convenience functions
    var debugging = sync(GeneralActions.debug);

    var log = function (message) {
      return sync(GeneralActions.log(message));
    };

    var wait = function (amount) {
      return async(AsyncActions.delay(amount));
    };

    var fail = function (message) {
      return async(AsyncActions.fail(message));
    };

    var pass = sync(GeneralActions.pass);

    return {
      stateful: stateful,
      control: control,
      sync: sync,
      async: async,
      debugging: debugging,
      log: log,
      wait: wait,
      fail: fail,
      pass: pass
    };
  }
);