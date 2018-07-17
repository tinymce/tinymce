export const Monitor = function <T>(initial: number, f: (...args) => T) {
  let value = initial;

  const run = function (...args: any[]): T {
    value++;
    return f.apply(f, args);
  };

  const get = function () {
    return value;
  };

  const clear = function () {
    value = initial;
  };

  return {
    run: run,
    get: get,
    clear: clear
  };
};