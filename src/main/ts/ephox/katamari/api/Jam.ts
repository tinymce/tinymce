/** intersperseThunk :: ([a], (_ -> a)) -> [a] */
export const intersperseThunk = function <T>(array: T[], delimiterThunk: () => T) {
  if (array === undefined) throw new Error('Cannot intersperse undefined');
  if (array.length <= 1) return array;

  const r: T[] = [];

  r.push(array[0]);
  for (let i = 1; i < array.length; i ++) {
    r.push(delimiterThunk());
    r.push(array[i]);
  }
  return r;
};

/** intersperse :: ([a], a) -> [a] */
export const intersperse = function <T> (array: T[], delimiter: T) {
  const thunk = function () {
    return delimiter;
  };

  return intersperseThunk(array, thunk);
};