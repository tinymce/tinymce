interface Monitor<T> {
  run: (...args: any[]) => T;
  get: () => number;
  clear: () => void;
}

export const Monitor = <T>(initial: number, f: (...args) => T): Monitor<T> => {
  let value = initial;

  const run = (...args: any[]): T => {
    value++;
    return f.apply(f, args);
  };

  const get = () => value;

  const clear = () => {
    value = initial;
  };

  return {
    run,
    get,
    clear
  };
};
