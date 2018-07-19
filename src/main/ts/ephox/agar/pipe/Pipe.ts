
export type NextFn<T> = (value: T) => void;
export type DieFn = (err: any) => void;
export type RunFn<T, U> = (value: T, next: NextFn<U>, die: DieFn) => void;

export const Pipe = function <T, U>(f: RunFn<T, U>): RunFn<T, U> {
  return function (value: T, next: NextFn<U>, die: DieFn) {
    try {
      f(value, next, die);
    } catch (err) {
      die(err);
    }
  };
};