import { Option } from './Option';
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

export const findMap = <A, B>(arr: ArrayLike<A>, f: (a: A, index: number) => Option<B>): Option<B> => {
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
export const liftN = <B>(arr: Option<any>[], f: (...args: any[]) => B): Option<B> => {
  const r: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x.isSome()) {
      r.push(x.getOrDie());
    } else {
      return Option.none<B>();
    }
  }
  return Option.some(<B> f.apply(null, r));
};

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

export const flatten = <T> (oot: Option<Option<T>>): Option<T> =>
  oot.bind(Fun.identity);

export const equals = <A> (oa: Option<A>, ob: Option<A>): boolean =>
  equals_(Fun.tripleEquals)(oa, ob);

export const equals_ = <A> (elementEq: (a: A, b: A) => boolean) => (oa: Option<A>, ob: Option<A>): boolean =>
  oa.fold(
    ob.isNone,
    (a: A) => ob.fold(Fun.constant(false), (b) => elementEq(a, b))
  );
