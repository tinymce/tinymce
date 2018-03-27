import Arr from '../api/Arr';
import Fun from '../api/Fun';

export default <T extends string>(...fields: T[]) => {
  return function(...values): {
    [key in T]: () => any
  } {
    if (fields.length !== values.length) {
      throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
    }

    var struct = {} as {[key in T]: () => any};
    Arr.each(fields, function (name, i) {
      struct[name] = Fun.constant(values[i]);
    });
    return struct;
  };
};