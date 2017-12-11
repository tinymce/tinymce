/** intersperseThunk :: ([a], (_ -> a)) -> [a] */
var intersperseThunk = function (array, delimiterThunk) {
  if (array === undefined) throw new Error('Cannot intersperse undefined');
  if (array.length <= 1) return array;

  var r = [];

  r.push(array[0]);
  for (var i = 1; i < array.length; i ++) {
    r.push(delimiterThunk());
    r.push(array[i]);
  }
  return r;
};

/** intersperse :: ([a], a) -> [a] */
var intersperse = function (array, delimiter) {
  var thunk = function () {
    return delimiter;
  };

  return intersperseThunk(array, thunk);
};

export default <any> {
  intersperse: intersperse,
  intersperseThunk: intersperseThunk
};