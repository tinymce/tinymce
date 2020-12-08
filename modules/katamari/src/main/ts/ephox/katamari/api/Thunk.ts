export const cached = <T extends (...args: any[]) => any>(f: T): (...args: Parameters<T>) => ReturnType<T> => {
  let called = false;
  let r: any;
  return (...args) => {
    if (!called) {
      called = true;
      r = f.apply(null, args);
    }
    return r;
  };
};
