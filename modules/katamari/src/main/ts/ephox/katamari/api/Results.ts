import { Adt } from './Adt';
import * as Arr from './Arr';
import * as Fun from './Fun';
import { Result } from './Result';

interface ComparisonAdt<A, B> {
  readonly fold: <T> (
    bothErrors: (error1: B, error2: B) => T,
    firstError: (error1: B, value2: A) => T,
    secondError: (value1: A, error2: B) => T,
    bothValues: (value1: A, value2: A) => T,
  ) => T;
  readonly match: <T> (branches: {
    bothErrors: (error1: B, error2: B) => T;
    firstError: (error1: B, value2: A) => T;
    secondError: (value1: A, error2: B) => T;
    bothValues: (value1: A, value2: A) => T;
  }) => T;
  readonly log: (label: string) => void;
}

const comparison: {
  readonly bothErrors: <A, B>(error1: B, error2: B) => ComparisonAdt<A, B>;
  readonly firstError: <A, B>(error1: B, value2: A) => ComparisonAdt<A, B>;
  readonly secondError: <A, B>(value1: A, error2: B) => ComparisonAdt<A, B>;
  readonly bothValues: <A, B>(value1: A, value2: A) => ComparisonAdt<A, B>;
} = Adt.generate([
  { bothErrors: [ 'error1', 'error2' ] },
  { firstError: [ 'error1', 'value2' ] },
  { secondError: [ 'value1', 'error2' ] },
  { bothValues: [ 'value1', 'value2' ] }
]);

/** partition :: [Result a] -> { errors: [String], values: [a] } */
export const partition = <T, E>(results: Result<T, E>[]): { values: T[]; errors: E[] } => {
  const errors: E[] = [];
  const values: T[] = [];

  Arr.each(results, (result: Result<T, E>) => {
    result.fold(
      (err) => {
        errors.push(err);
      },
      (value) => {
        values.push(value);
      }
    );
  });

  return { errors, values };
};

export const compare = <A, B>(result1: Result<A, B>, result2: Result<A, B>): ComparisonAdt<A, B> => {
  return result1.fold((err1) => {
    return result2.fold((err2) => {
      return comparison.bothErrors(err1, err2);
    }, (val2) => {
      return comparison.firstError(err1, val2);
    });
  }, (val1) => {
    return result2.fold((err2) => {
      return comparison.secondError(val1, err2);
    }, (val2) => {
      return comparison.bothValues(val1, val2);
    });
  });
};

export const unite: <T>(result: Result<T, T>) => T = <T>(result: Result<T, T>): T =>
  result.fold(Fun.identity, Fun.identity);

export const is = <A, B>(result: Result<A, B>, value: A): boolean =>
  result.exists((r) => r === value);
