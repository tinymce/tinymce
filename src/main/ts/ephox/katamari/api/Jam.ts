/** intersperseThunk :: ([a], (_ -> a)) -> [a] */
var intersperseThunk = function <T>(array: T[], delimiterThunk: () => T) {
  if (array === undefined) throw new Error('Cannot intersperse undefined');
  if (array.length <= 1) return array;

  var r: T[] = [];

  r.push(array[0]);
  for (var i = 1; i < array.length; i ++) {
    r.push(delimiterThunk());
    r.push(array[i]);
  }
  return r;
};

/** intersperse :: ([a], a) -> [a] */
var intersperse = function <T> (array: T[], delimiter: T) {
  var thunk = function () {
    return delimiter;
  };

  return intersperseThunk(array, thunk);
};

export default {
  intersperse: intersperse,
  intersperseThunk: intersperseThunk
};