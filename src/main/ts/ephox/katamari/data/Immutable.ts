import * as Arr from '../api/Arr';
import * as Fun from '../api/Fun';

export const Immutable = <T = Record<string,() => any>>(...fields: string[]) => {
  return function(...values: any[]): T {
    if (fields.length !== values.length) {
      throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
    }

    const struct: Record<string,() => any> = {};
    Arr.each(fields, function (name, i) {
      struct[name] = Fun.constant(values[i]);
    });
    return <any>struct;
  };
};