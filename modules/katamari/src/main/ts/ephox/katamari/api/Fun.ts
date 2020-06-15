const noop: (...args: any[]) => void
= () => { };

const noarg: <T>(f: () => T) => (...args: any[]) => void
= (f) => () => f();

/** Compose a unary function with an n-ary function */
const compose = function <T extends any[], U, V> (fa: (v: U) => V, fb: (...x: T) => U): (...x: T) => V {
  return function (...args: T) {
    return fa(fb.apply(null, args));
  };
};

/** Compose two unary functions. Similar to compose, but avoids using Function.prototype.apply. */
const compose1 = <A, B, C> (fbc: (b: B) => C, fab: (a: A) => B) => (a: A): C =>
  fbc(fab(a));

const constant = function <T> (value: T): () => T {
  return function () {
    return value;
  };
};

const identity = function <T = any> (x: T): T {
  return x;
};

const tripleEquals = function <T> (a: T, b: T): boolean {
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
function curry <OUT>(fn: (...allArgs: any[]) => OUT, ...initialArgs: any[]): (...restArgs: any[]) => OUT {
  return function (...restArgs: any[]) {
    const all = initialArgs.concat(restArgs);
    return fn.apply(null, all);
  };
}

const not = <T> (f: (t: T) => boolean) => (t: T): boolean =>
  !f(t);

const die = function (msg: string) {
  return function () {
    throw new Error(msg);
  };
};

const apply = function <T> (f: () => T): T {
  return f();
};

const call = function (f: () => any) {
  f();
};

const never = constant<false>(false) as (...args: any[]) => false;
const always = constant<true>(true) as (...args: any[]) => true;

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
  always
};
