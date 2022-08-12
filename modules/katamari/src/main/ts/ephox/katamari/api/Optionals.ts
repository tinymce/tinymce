import * as Arr from './Arr';
import * as Fun from './Fun';
import { Optional } from './Optional';

/**
 * **Is** the value stored inside this Optional object equal to `rhs`?
 */
export const is = <T>(lhs: Optional<T>, rhs: T, comparator: (a: T, b: T) => boolean = Fun.tripleEquals): boolean =>
  lhs.exists((left) => comparator(left, rhs));

/**
 * Are these two Optional objects equal? Equality here means either they're both
 * `Some` (and the values are equal under the comparator) or they're both `None`.
 */
export const equals: {
  <A, B>(lhs: Optional<A>, rhs: Optional<B>, comparator: (a: A, b: B) => boolean): boolean;
  <T>(lhs: Optional<T>, rhs: Optional<T>): boolean;
} = <A, B>(lhs: Optional<A>, rhs: Optional<B>, comparator: (a: A, b: B) => boolean = Fun.tripleEquals as any): boolean =>
  lift2(lhs, rhs, comparator).getOr(lhs.isNone() && rhs.isNone());

export const cat = <A>(arr: Optional<A>[]): A[] => {
  const r: A[] = [];
  const push = (x: A) => {
    r.push(x);
  };
  for (let i = 0; i < arr.length; i++) {
    arr[i].each(push);
  }
  return r;
};

export const sequence = <A> (arr: ArrayLike<Optional<A>>): Optional<Array<A>> => {
  const r: A[] = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x.isSome()) {
      r.push(x.getOrDie());
    } else {
      return Optional.none<Array<A>>();
    }
  }
  return Optional.some(r);
};

/** @deprecated Use Arr.findMap instead. */
export const findMap = Arr.findMap;

/** Map each element of an array to an Optional and collect the results.
 *  If all results are "some", return Optional.some of the results.
 *  If any result is "none", return Optional.none
 */
export const traverse = <A, B> (arr: ArrayLike<A>, f: (a: A) => Optional<B>): Optional<Array<B>> =>
  sequence(Arr.map(arr, f));

/*
Notes on the lift functions:
- We used to have a generic liftN, but we were concerned about its type-safety, and the below variants were faster in microbenchmarks.
- The getOrDie calls are partial functions, but are checked beforehand. This is faster and more convenient (but less safe) than folds.
- && is used instead of a loop for simplicity and performance.
*/

export const lift2 = <A, B, C> (oa: Optional<A>, ob: Optional<B>, f: (a: A, b: B) => C): Optional<C> =>
  oa.isSome() && ob.isSome() ? Optional.some(f(oa.getOrDie(), ob.getOrDie())) : Optional.none<C>();

export const lift3 = <A, B, C, D> (oa: Optional<A>, ob: Optional<B>, oc: Optional<C>, f: (a: A, b: B, c: C) => D): Optional<D> =>
  oa.isSome() && ob.isSome() && oc.isSome() ? Optional.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie())) : Optional.none<D>();

export const lift4 = <A, B, C, D, E> (oa: Optional<A>, ob: Optional<B>, oc: Optional<C>, od: Optional<D>, f: (a: A, b: B, c: C, d: D) => E): Optional<E> =>
  oa.isSome() && ob.isSome() && oc.isSome() && od.isSome() ? Optional.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie(), od.getOrDie())) : Optional.none<E>();

export const lift5 = <A, B, C, D, E, F> (oa: Optional<A>, ob: Optional<B>, oc: Optional<C>, od: Optional<D>, oe: Optional<E>, f: (a: A, b: B, c: C, d: D, e: E) => F): Optional<F> =>
  oa.isSome() && ob.isSome() && oc.isSome() && od.isSome() && oe.isSome() ? Optional.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie(), od.getOrDie(), oe.getOrDie())) : Optional.none<F>();

export const mapFrom = <A, B> (a: A | null | undefined, f: (a: A) => B): Optional<B> =>
  (a !== undefined && a !== null) ? Optional.some(f(a)) : Optional.none<B>();

export const bindFrom = <A, B> (a: A | null | undefined, f: (a: A) => Optional<B>): Optional<B> =>
  (a !== undefined && a !== null) ? f(a) : Optional.none<B>();

export const flatten = <T> (oot: Optional<Optional<T>>): Optional<T> => oot.bind(Fun.identity);

// This can help with type inference, by specifying the type param on the none case, so the caller doesn't have to.
export const someIf = <A> (b: boolean, a: A): Optional<A> =>
  b ? Optional.some(a) : Optional.none<A>();
