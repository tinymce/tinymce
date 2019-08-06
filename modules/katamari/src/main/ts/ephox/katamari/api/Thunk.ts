export const cached = function (f: Function) {
  let called = false;
  let r: any;
  return function (...args: any[]) {
    if (!called) {
      called = true;
      r = f.apply(null, args);
    }
    return r;
  };
};
