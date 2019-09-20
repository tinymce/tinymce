import { Option } from './Option';
import * as Arr from './Arr';
import * as Fun from './Fun';

export const cat = <A>(arr: Option<A>[]): A[] => {
  const r: A[] = [];
  const push = (x: A) => {
    r.push(x);
  };
  for (let i = 0; i < arr.length; i++) {
    arr[i].each(push);
  }
  return r;
};

export const sequence = <A> (arr: ArrayLike<Option<A>>): Option<Array<A>> => {
  const r: A[] = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x.isSome()) {
      r.push(x.getOrDie());
    } else {
      return Option.none<Array<A>>();
    }
  }
  return Option.some(r);
};

export const findMap = <A, B>(arr: ArrayLike<A>, f: (a: A, index: number) => Option<B>): Option<B> => {
  for (let i = 0; i < arr.length; i++) {
    const r = f(arr[i], i);
    if (r.isSome()) {
      return r;
    }
  }
  return Option.none<B>();
};

/** Map each element of an array to an Option and collect the results.
 *  If all results are "some", return Option.some of the results.
 *  If any result is "none", return Option.none
 */
export const traverse = <A, B> (arr: ArrayLike<A>, f: (a: A) => Option<B>): Option<Array<B>> =>
  sequence(Arr.map(arr, f));

/*
Notes on the lift functions:
- We used to have a generic liftN, but we were concerned about its type-safety, and the below variants were faster in microbenchmarks.
- The getOrDie calls are partial functions, but are checked beforehand. This is faster and more convenient (but less safe) than folds.
- && is used instead of a loop for simplicity and performance.
*/

export const lift2 = <A, B, C> (oa: Option<A>, ob: Option<B>, f: (a: A, b: B) => C): Option<C> =>
  oa.isSome() && ob.isSome() ? Option.some(f(oa.getOrDie(), ob.getOrDie())) : Option.none<C>();

export const lift3 = <A, B, C, D> (oa: Option<A>, ob: Option<B>, oc: Option<C>, f: (a: A, b: B, c: C) => D): Option<D> =>
  oa.isSome() && ob.isSome() && oc.isSome() ? Option.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie())) : Option.none<D>();

export const lift4 = <A, B, C, D, E> (oa: Option<A>, ob: Option<B>, oc: Option<C>, od: Option<D>, f: (a: A, b: B, c: C, d: D) => E): Option<E> =>
  oa.isSome() && ob.isSome() && oc.isSome() && od.isSome() ? Option.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie(), od.getOrDie())) : Option.none<E>();

export const lift5 = <A, B, C, D, E, F> (oa: Option<A>, ob: Option<B>, oc: Option<C>, od: Option<D>, oe: Option<E>, f: (a: A, b: B, c: C, d: D, e: E) => F): Option<F> =>
  oa.isSome() && ob.isSome() && oc.isSome() && od.isSome() && oe.isSome() ? Option.some(f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie(), od.getOrDie(), oe.getOrDie())) : Option.none<F>();

export const mapFrom = <A, B> (a: A | null | undefined, f: (a: A) => B): Option<B> =>
  (a !== undefined && a !== null) ? Option.some(f(a)) : Option.none<B>();

export const bindFrom = <A, B> (a: A | null | undefined, f: (a: A) => Option<B>): Option<B> =>
  (a !== undefined && a !== null) ? f(a) : Option.none<B>();

export const flatten = <T> (oot: Option<Option<T>>): Option<T> => oot.bind(Fun.identity);

// This can help with type inference, by specifying the type param on the none case, so the caller doesn't have to.
export const someIf = <A> (b: boolean, a: A): Option<A> =>
  b ? Option.some(a) : Option.none<A>();
