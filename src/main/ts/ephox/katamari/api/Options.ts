import Option, { OptionType } from './Option';

/** cat :: [Option a] -> [a] */
var cat = function <A> (arr: OptionType<A>[]) {
  var r: A[] = [];
  var push = function (x: A) {
    r.push(x);
  };
  for (var i = 0; i < arr.length; i++) {
    arr[i].each(push);
  }
  return r;
};

/** findMap :: ([a], (a, Int -> Option b)) -> Option b */
var findMap = function <A, B> (arr: A[], f: (a: A, index: number) => OptionType<B>) {
  for (var i = 0; i < arr.length; i++) {
    var r = f(arr[i], i);
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
var liftN = function <B> (arr: OptionType<any>[], f: (...args: any[]) => B) {
  var r: any[] = [];
  for (var i = 0; i < arr.length; i++) {
    var x = arr[i];
    if (x.isSome()) {
      r.push(x.getOrDie());
    } else {
      return Option.none<B>();
    }
  }
  return Option.some(<B>f.apply(null, r));
};

export default {
  cat: cat,
  findMap: findMap,
  liftN: liftN
};