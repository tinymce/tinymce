export interface Cell<T> {
  get: () => T;
  set: (value: T) => void;
  clone: () => Cell<T>;
}

export const Cell = <T>(initial: T): Cell<T> => {
  let value = initial;

  const get = function () {
    return value;
  };

  const set = function (v) {
    value = v;
  };

  const clone = function () {
    return Cell(get());
  };

  return {
    get: get,
    set: set,
    clone: clone
  };
};
