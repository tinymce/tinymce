export interface Cell<T> {
  readonly get: () => T;
  readonly set: (value: T) => void;
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
