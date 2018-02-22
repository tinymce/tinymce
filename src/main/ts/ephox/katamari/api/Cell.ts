export interface Cell<T> {
  get: () => T;
  set: (value: T) => void;
  clone: () => Cell<T>;
}

export const Cell = <T>(initial: T): Cell<T> => {
  var value = initial;

  var get = function () {
    return value;
  };

  var set = function (v) {
    value = v;
  };

  var clone = function () {
    return Cell(get());
  };

  return {
    get: get,
    set: set,
    clone: clone
  };
};
