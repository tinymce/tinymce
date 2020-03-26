import { Logger } from '@ephox/agar';
import Jsc from '@ephox/wrap-jsverify';

// DUPE with agar.
const getTrace = function (err: any) { // TODO narrow type
  if (err.exc !== undefined && err.exc.stack !== undefined) {
    return err.exc.stack;
  } else if (err.exc !== undefined) {
    return err.exc;
  }
  return '-- no trace available --';
};

const formatErr = function (label: string, err: any) { // TODO narrow type
  return err.counterexample !== undefined ? (label + '\n' + err.exc.message + '\n' + getTrace(err) + '\n' + err.counterexamplestr + '\n' +
    JSON.stringify({ rngState: err.rngState, shrinks: err.shrinks, tests: err.tests }, null, 2)) : err;
};

const checkWith = function <T extends any[]> (label: string, arbitraries: T, f: Function, options: Record<string, any> = {}) { // TODO narrow types
  // NOTE: Due to a current implementation detail of Jsc's wrapper, these will not have labels in the console
  // However, use this one if you want to supply options (like seed, number of tests etc.)
  Logger.sync(label, function () {
    const property = Jsc.forall.apply(Jsc, [ ...arbitraries, f ]);
    try {
      const output = Jsc.check(property, options);
      if (output !== true) {
        throw new Error(formatErr(label, output));
      }
    } catch (err) {
      throw new Error(formatErr(label, err));
    }
    return true;
  });
};

const check = function <T extends any[]> (label: string, arbitraries: T, f: Function) { // TODO narrow types
  Jsc.property.apply(Jsc, [ label, ...arbitraries, f ]);
};

export {
  check,
  checkWith
};
