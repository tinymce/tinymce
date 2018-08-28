export const noop = function (...x: any[]) { };

export const noarg = function (f: Function) {
  return function (...x: any[]) {
    return f();
  };
};

type AnyFunction = (...x: any[]) => any;

export const compose = function (fa: AnyFunction, fb: AnyFunction): AnyFunction {
  return function (...x: any[]) {
    return fa(fb.apply(null, arguments));
  };
};

export const constant = function <T>(value?: T): (...x: any[]) => T {
  return function () {
    return value;
  };
};

export const identity = function <T = any>(x: T): T {
  return x;
};

export const tripleEquals = function <T>(a: T, b: T): boolean {
  return a === b;
};

// Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
export const curry = function (f, ...x: any[]): AnyFunction {
  // equivalent to arguments.slice(1)
  // starting at 1 because 0 is the f, makes things tricky.
  // Pay attention to what variable is where, and the -1 magic.
  // thankfully, we have tests for this.
  const args = new Array(arguments.length - 1);
  for (let i = 1; i < arguments.length; i++) args[i-1] = arguments[i];

  return function (...x: any[]) {
    const newArgs = new Array(arguments.length);
    for (let j = 0; j < newArgs.length; j++) newArgs[j] = arguments[j];

    const all = args.concat(newArgs);
    return f.apply(null, all);
  };
};

type PredicateFn = (...x: any[]) => boolean;

export const not = (f: PredicateFn): PredicateFn => {
  return function (...x: any[]) {
    return !f.apply(null, arguments);
  };
};

export const die = function (msg: string) {
  return function () {
    throw new Error(msg);
  };
};

export const apply = function <T>(f: (...x: any[]) => T): T  {
  return f();
};

export const call = function(f: AnyFunction) {
  f();
};

export const never = constant<false>(false);
export const always = constant<true>(true);
