import * as Type from './Type';

const noop: (...args: any[]) => void
= () => { };

const noarg: <T>(f: () => T) => (...args: any[]) => void
= (f) => () => f();

/** Compose a unary function with an n-ary function */
const compose = <T extends any[], U, V>(fa: (v: U) => V, fb: (...x: T) => U): (...x: T) => V => {
  return (...args: T) => {
    return fa(fb.apply(null, args));
  };
};

/** Compose two unary functions. Similar to compose, but avoids using Function.prototype.apply. */
const compose1 = <A, B, C> (fbc: (b: B) => C, fab: (a: A) => B) => (a: A): C =>
  fbc(fab(a));

const constant = <T>(value: T): () => T => {
  return () => {
    return value;
  };
};

const identity = <T = any>(x: T): T => {
  return x;
};

const tripleEquals = <T>(a: T, b: T): boolean => {
  return a === b;
};

function curry <REST extends any[], OUT>(fn: (...restArgs: REST) => OUT): (...restArgs: REST) => OUT;
function curry <A, REST extends any[], OUT>(fn: (a: A, ...restArgs: REST) => OUT, a: A): (...restArgs: REST) => OUT;
function curry <A, B, REST extends any[], OUT>(fn: (a: A, b: B, ...restArgs: REST) => OUT, a: A, b: B): (...restArgs: REST) => OUT;
function curry <A, B, C, REST extends any[], OUT>(fn: (a: A, b: B, c: C, ...restArgs: REST) => OUT, a: A, b: B, c: C): (...restArgs: REST) => OUT;
function curry <A, B, C, D, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D): (...restArgs: REST) => OUT;
function curry <A, B, C, D, E, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, e: E, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D, e: E): (...restArgs: REST) => OUT;
function curry <A, B, C, D, E, F, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D, e: E, f: F): (...restArgs: REST) => OUT;
function curry <A, B, C, D, E, F, G, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D, e: E, f: F, g: G): (...restArgs: REST) => OUT;
function curry <A, B, C, D, E, F, G, H, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): (...restArgs: REST) => OUT;
function curry <A, B, C, D, E, F, G, H, I, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I): (...restArgs: REST) => OUT;
function curry <A, B, C, D, E, F, G, H, I, J, REST extends any[], OUT>(fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, ...restArgs: REST) => OUT, a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J): (...restArgs: REST) => OUT;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function curry <OUT>(fn: (...allArgs: any[]) => OUT, ...initialArgs: any[]): (...restArgs: any[]) => OUT {
  return (...restArgs: any[]) => {
    const all = initialArgs.concat(restArgs);
    return fn.apply(null, all);
  };
}

const not = <T>(f: (t: T) => boolean) => (t: T): boolean =>
  !f(t);

const die = (msg: string) => {
  return (): never => {
    throw new Error(msg);
  };
};

const apply = <T>(f: () => T): T => {
  return f();
};

const call = (f: () => any): void => {
  f();
};

const never: (...args: any[]) => false = constant<false>(false);
const always: (...args: any[]) => true = constant<true>(true);

/* Used to weaken types */
const weaken = <A, B extends A>(b: B): A => b;

type Fun<X, Y> = (x: X) => Y;
const pipe: {
  <A, B>(a: A, ab: Fun<A, B>): B;
  <A, B, C>(a: A, ab: Fun<A, B>, bc: Fun<B, C>): C;
  <A, B, C, D>(a: A, ab: Fun<A, B>, bc: Fun<B, C>, cd: Fun<C, D>): D;
  <A, B, C, D, E>(a: A, ab: Fun<A, B>, bc: Fun<B, C>, cd: Fun<C, D>, de: Fun<D, E>): E;
  <A, B, C, D, E, F>(a: A, ab: Fun<A, B>, bc: Fun<B, C>, cd: Fun<C, D>, de: Fun<D, E>, ef: Fun<E, F>): F;
  <A, B, C, D, E, F, G>(a: A, ab: Fun<A, B>, bc: Fun<B, C>, cd: Fun<C, D>, de: Fun<D, E>, ef: Fun<E, F>, fg: Fun<F, G>): G;
  <A, B, C, D, E, F, G, H>(a: A, ab: Fun<A, B>, bc: Fun<B, C>, cd: Fun<C, D>, de: Fun<D, E>, ef: Fun<E, F>, fg: Fun<F, G>, gh: Fun<G, H>): H;
} =
  <A, B, C, D, E, F, G, H>(a: A, ab: Fun<A, B>, bc?: Fun<B, C>, cd?: Fun<C, D>, de?: Fun<D, E>, ef?: Fun<E, F>, fg?: Fun<F, G>, gh?: Fun<G, H>): B | C | D | E | F | G | H => {
    const b = ab(a);
    if (Type.isNullable(bc)) {
      return b;
    }

    const c = bc(b);
    if (Type.isNullable(cd)) {
      return c;
    }

    const d = cd(c);
    if (Type.isNullable(de)) {
      return d;
    }

    const e = de(d);
    if (Type.isNullable(ef)) {
      return e;
    }

    const f = ef(e);
    if (Type.isNullable(fg)) {
      return f;
    }

    const g = fg(f);
    if (Type.isNullable(gh)) {
      return g;
    }

    return gh(g);
  };

export {
  noop,
  noarg,
  compose,
  compose1,
  constant,
  identity,
  tripleEquals,
  curry,
  not,
  die,
  apply,
  call,
  never,
  always,
  weaken,
  pipe
};
