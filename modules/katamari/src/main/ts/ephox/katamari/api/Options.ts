import { Option } from './Option';

/** cat :: [Option a] -> [a] */
const cat = function <A> (arr: Option<A>[]) {
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
const findMap = function <A, B> (arr: ArrayLike<A>, f: (a: A, index: number) => Option<B>) {
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
const liftN = function <B> (arr: Option<any>[], f: (...args: any[]) => B) {
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

function lift<A, B, C>(a: Option<A>, b: Option<B>, f: (a: A, b: B) => C): Option<C>;
function lift<A, B, C, D>(a: Option<A>, b: Option<B>, c: Option<C>, f: (a: A, b: B, c: C) => D): Option<D>;
function lift<A, B, C, D, E>(a: Option<A>, b: Option<B>, c: Option<C>, d: Option<D>, f: (a: A, b: B, c: C, d: D) => E): Option<E>;
function lift<A, B, C, D, E, F>(a: Option<A>, b: Option<B>, c: Option<C>, d: Option<D>, e: Option<E>, f: (a: A, b: B, c: C, d: D, e: E) => F): Option<F>;
function lift(...args) {
  const f = args.pop();
  return liftN(args, f);
}

export {
  cat,
  findMap,
  liftN,
  lift
};
