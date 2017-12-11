import { Logger } from '@ephox/agar';
import { JSON as Json } from '@ephox/sand';
import Jsc from '@ephox/wrap-jsverify';

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

var checkWith = function (label, arbitraries, f, _options) {
  // NOTE: Due to a current implementation detail of Jsc's wrapper, these will not have labels in the console
  // However, use this one if you want to supply options (like seed, number of tests etc.)
  Logger.sync(label, function () {
    var options = _options !== undefined ? _options : { };
    var property = Jsc.forall.apply(Jsc, arbitraries.concat([ f ]));
    try {
      var output = Jsc.check(property, options);
      if (output !== true) throw new Error(formatErr(label, output));
    } catch (err) {
      throw new Error(formatErr(label, err));
    }
    return true;
  });
};

var check = function (label, arbitraries, f) {
  Jsc.property.apply(Jsc, [ label ].concat(arbitraries).concat([ f ]));
};

export default <any> {
  check :check,
  checkWith: checkWith
};