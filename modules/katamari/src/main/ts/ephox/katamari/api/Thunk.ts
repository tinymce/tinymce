export const cached = <T extends (...args: any[]) => any>(f: T) => {
  let called = false;
  let r: any;
  return (...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true;
      r = f.apply(null, args);
    }
    return r;
  };
};
