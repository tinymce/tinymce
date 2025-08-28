import * as Arr from '../api/Arr';

/*
 * NOTE: an `asyncValue` must have a `get` function which gets given a callback and calls
 * that callback with a value once it is ready
 *
 * e.g
 * {
 *   get: (callback) => { callback(10); }
 * }
 */
export const par = <A, T, C> (asyncValues: ArrayLike<(A & { get: (callback: (value: T) => void) => void })>, nu: (worker: (callback: (values: T[]) => void) => void) => C): C => {
  return nu((callback) => {
    const r: T[] = [];
    let count = 0;

    const cb = (i: number) => {
      return (value: T) => {
        r[i] = value;
        count++;
        if (count >= asyncValues.length) {
          callback(r);
        }
      };
    };

    if (asyncValues.length === 0) {
      callback([]);
    } else {
      Arr.each(asyncValues, (asyncValue: A & { get: (callback: (value: T) => void) => void }, i) => {
        asyncValue.get(cb(i));
      });
    }
  });
};
