import { Adt } from './Adt';
import * as Arr from './Arr';
import * as Fun from './Fun';
import { Result } from './Result';

const comparison = Adt.generate([
  { bothErrors: [ 'error1', 'error2' ] },
  { firstError: [ 'error1', 'value2' ] },
  { secondError: [ 'value1', 'error2' ] },
  { bothValues: [ 'value1', 'value2' ] }
]);

/** partition :: [Result a] -> { errors: [String], values: [a] } */
export const partition = function <T, E> (results: Result<T, E>[]): { values: T[]; errors: E[] } {
  const errors: E[] = [];
  const values: T[] = [];

  Arr.each(results, function (result: Result<T, E>) {
    result.fold(
      function (err) { errors.push(err); },
      function (value) { values.push(value); }
    );
  });

  return { errors, values };
};

export const compare = function<A, B> (result1: Result<A, B>, result2: Result<A, B>) {
  return result1.fold(function (err1) {
    return result2.fold(function (err2) {
      return comparison.bothErrors(err1, err2);
    }, function (val2) {
      return comparison.firstError(err1, val2);
    });
  }, function (val1) {
    return result2.fold(function (err2) {
      return comparison.secondError(val1, err2);
    }, function (val2) {
      return comparison.bothValues(val1, val2);
    });
  });
};

export const unite: <T>(result: Result<T, T>) => T = <T>(result: Result<T, T>): T =>
  result.fold(Fun.identity, Fun.identity);
