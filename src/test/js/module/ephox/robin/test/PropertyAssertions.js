define(
  'ephox.robin.test.PropertyAssertions',

  [
    'ephox.agar.api.Logger',
    'ephox.numerosity.api.JSON',
    'ephox.wrap.Jsc',
    'global!Error'
  ],

  function (Logger, Json, Jsc, Error) {
    // DUPE with agar.
    var getTrace = function (err) {
      if (err.exc !== undefined && err.exc.stack !== undefined) return err.exc.stack;
      else if (err.exc !== undefined) return err.exc;
      return '-- no trace available --';
    };

    var formatErr = function (label, err) {
      return err.counterexample !== undefined ? (label + '\n' + err.exc.message + '\n' + getTrace(err) + '\n' + err.counterexamplestr + '\n' +
        Json.stringify({ rngState: err.rngState, shrinks: err.shrinks, tests: err.tests }, null, 2)) : err;
    };

    var check = function (label, arbitraries, f, _options) {
      Logger.sync(label, function () {
        var options = _options !== undefined ? _options : { };
        var property = Jsc.forall.apply(Jsc, arbitraries.concat([ f ]));
        try {
          var output = Jsc.check(property, options);
          if (output !== true) throw new Error(formatErr(label, output));
        } catch (err) {
          throw new Error(formatErr(label, err));
        }
      });
    };

    return {
      check :check
    };
  }
);