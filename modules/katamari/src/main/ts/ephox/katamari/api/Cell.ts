export interface Cell<T> {
  get: () => T;
  set: (value: T) => void;
}

export const Cell = <T>(initial: T): Cell<T> => {
  let value = initial;

  const get = () => {
    return value;
  };

  const set = (v: T) => {
    value = v;
  };

  return {
    get,
    set
  };
};
