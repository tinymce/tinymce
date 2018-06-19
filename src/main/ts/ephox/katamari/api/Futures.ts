import * as Arr from './Arr';
import { Future } from './Future';
import * as AsyncValues from '../async/AsyncValues';

/** par :: [Future a] -> Future [a] */
export const par = function <T> (futures: Future<T>[]) {
  return AsyncValues.par(futures, Future.nu);
};

/** mapM :: [a] -> (a -> Future b) -> Future [b] */
export const mapM = function <A,B> (array: A[], fn: (value: A) => Future<B>) {
  const futures: Future<B>[] = Arr.map(array, fn);
  return par(futures);
};

/** Kleisli composition of two functions: a -> Future b.
 *  Note the order of arguments: g is invoked first, then the result passed to f.
 *  This is in line with f . g = \x -> f (g a)
 *
 *  compose :: ((b -> Future c), (a -> Future b)) -> a -> Future c
 */
export const compose = function <A,B,C> (f: (b: B) => Future<C>, g: (a: A) => Future<B>) {
  return function (a: A) {
    return g(a).bind(f);
  };
};
