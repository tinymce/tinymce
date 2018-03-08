var noop = function () { };

var noarg = function (f: Function) {
  return function (...x: any[]) {
    return f();
  };
};

type AnyFunction = (...x: any[]) => any;

var compose = function (fa: AnyFunction, fb: AnyFunction): AnyFunction {
  return function (...x: any[]) {
    return fa(fb.apply(null, arguments));
  };
};

var constant = function <T>(value?: T): (...x: any[]) => T {
  return function () {
    return value;
  };
};

var identity = function <T>(x: T): T {
  return x;
};

var tripleEquals = function <T>(a: T, b: T): boolean {
  return a === b;
};

// Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
var curry = function (f, ...x: any[]): AnyFunction {
  // equivalent to arguments.slice(1)
  // starting at 1 because 0 is the f, makes things tricky.
  // Pay attention to what variable is where, and the -1 magic.
  // thankfully, we have tests for this.
  var args = new Array(arguments.length - 1);
  for (var i = 1; i < arguments.length; i++) args[i-1] = arguments[i];

  return function (...x: any[]) {
    var newArgs = new Array(arguments.length);
    for (var j = 0; j < newArgs.length; j++) newArgs[j] = arguments[j];

    var all = args.concat(newArgs);
    return f.apply(null, all);
  };
};

type PredicateFn = (...x: any[]) => boolean;

var not = (f: PredicateFn): PredicateFn => {
  return function (...x: any[]) {
    return !f.apply(null, arguments);
  };
};

var die = function (msg: string) {
  return function () {
    throw new Error(msg);
  };
};

var apply = function <T>(f: (...x: any[]) => T): T  {
  return f();
};

var call = function(f: AnyFunction) {
  f();
};

var never = constant<false>(false);
var always = constant<true>(true);

export default {
  noop,
  noarg,
  compose,
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