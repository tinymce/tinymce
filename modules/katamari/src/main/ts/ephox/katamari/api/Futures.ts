import * as AsyncValues from '../async/AsyncValues';
import * as Arr from './Arr';
import { Future } from './Future';

export const par = <T>(futures: ArrayLike<Future<T>>): Future<Array<T>> =>
  AsyncValues.par<Future<T>, T, Future<Array<T>>>(futures, Future.nu);

export const traverse = <A, B>(array: ArrayLike<A>, fn: (value: A) => Future<B>): Future<B[]> =>
  par(Arr.map(array, fn));

/** Deprecated for rename to traverse */
export const mapM = traverse;

/** Kleisli composition of two functions: a -> Future b.
 *  Note the order of arguments: g is invoked first, then the result passed to f.
 *  This is in line with f . g = \x -> f (g a)
 *
 *  compose :: ((b -> Future c), (a -> Future b)) -> a -> Future c
 */
export const compose = <A, B, C>(f: (b: B) => Future<C>, g: (a: A) => Future<B>) => (a: A): Future<C> => g(a).bind(f);
