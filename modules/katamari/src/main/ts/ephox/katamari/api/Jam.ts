/** intersperseThunk :: ([a], (_ -> a)) -> [a] */
export const intersperseThunk = <T>(array: T[], delimiterThunk: () => T): T[] => {
  if (array === undefined) {
    throw new Error('Cannot intersperse undefined');
  }
  if (array.length <= 1) {
    return array;
  }

  const r: T[] = [];

  r.push(array[0]);
  for (let i = 1; i < array.length; i++) {
    r.push(delimiterThunk());
    r.push(array[i]);
  }
  return r;
};

/** intersperse :: ([a], a) -> [a] */
export const intersperse = <T>(array: T[], delimiter: T): T[] => {
  const thunk = () => {
    return delimiter;
  };

  return intersperseThunk(array, thunk);
};
