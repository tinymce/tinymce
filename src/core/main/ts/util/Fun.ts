/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * Functional utility class.
 *
 * @private
 * @class tinymce.util.Fun
 */

const slice = [].slice;

const constant = function (value) {
  return function () {
    return value;
  };
};

const negate = function (predicate) {
  return function (x) {
    return !predicate(x);
  };
};

const compose = function (f, g) {
  return function (x) {
    return f(g(x));
  };
};

const or = function (...x: any[]) {
  const args = slice.call(arguments);

  return function (x) {
    for (let i = 0; i < args.length; i++) {
      if (args[i](x)) {
        return true;
      }
    }

    return false;
  };
};

const and = function (...x: any[]) {
  const args = slice.call(arguments);

  return function (x) {
    for (let i = 0; i < args.length; i++) {
      if (!args[i](x)) {
        return false;
      }
    }

    return true;
  };
};

const curry = function (fn, ...x: any[]) {
  const args = slice.call(arguments);

  if (args.length - 1 >= fn.length) {
    return fn.apply(this, args.slice(1));
  }

  return function () {
    const tempArgs = args.concat([].slice.call(arguments));
    return curry.apply(this, tempArgs);
  };
};

const noop = function () {
};

export default {
  constant,
  negate,
  and,
  or,
  curry,
  compose,
  noop
};