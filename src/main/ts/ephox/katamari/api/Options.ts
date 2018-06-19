import { Option } from './Option';

/** cat :: [Option a] -> [a] */
export const cat = function <A> (arr: Option<A>[]) {
  const r: A[] = [];
  const push = function (x: A) {
    r.push(x);
  };
  for (let i = 0; i < arr.length; i++) {
    arr[i].each(push);
  }
  return r;
};

/** findMap :: ([a], (a, Int -> Option b)) -> Option b */
export const findMap = function <A, B> (arr: A[], f: (a: A, index: number) => Option<B>) {
  for (let i = 0; i < arr.length; i++) {
    const r = f(arr[i], i);
    if (r.isSome()) {
      return r;
    }
  }
  return Option.none<B>();
};

/**
 * if all elements in arr are 'some', their inner values are passed as arguments to f
 * f must have arity arr.length
*/
export const liftN = function <B> (arr: Option<any>[], f: (...args: any[]) => B) {
  const r: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x.isSome()) {
      r.push(x.getOrDie());
    } else {
      return Option.none<B>();
    }
  }
  return Option.some(<B>f.apply(null, r));
};