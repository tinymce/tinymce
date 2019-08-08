/* tslint:disable:no-shadowed-variable no-unimported-promise */
import { setTimeout, Window } from '@ephox/dom-globals';

/* eslint-disable */

/* jshint ignore:start */

/**
 * Modified to be a feature fill and wrapped as tinymce module.
 *
 * Promise polyfill under MIT license: https://github.com/taylorhakes/promise-polyfill
 */

/* jshint ignore:end */

/* eslint-enable */

type Callback<T, TResult = T> = ((value: T) => TResult | PromiseLike<TResult>);
type RejectFn = (reason?: any) => void;
type ResolveFn<T> = (value?: T | PromiseLike<T>) => void;
type Executor<T> = (resolve: ResolveFn<T>, reject: RejectFn) => void;

interface Deferred<T, TResult1 = T, TResult2 = never> {
  onFulfilled: Callback<T, TResult1> | null;
  onRejected: Callback<any, TResult2> | null;
  reject: RejectFn;
  resolve: ResolveFn<TResult1 | TResult2>;
}

interface PromisePolyfill<T> extends Promise<T> {
  _state: any;
  _value: any;
  _deferreds: Deferred<T>[];

  then<TResult1 = T, TResult2 = never>(onFulfilled?: Callback<T, TResult1> | undefined | null, onRejected?: Callback<any, TResult2> | undefined | null): PromisePolyfill<TResult1 | TResult2>;

  catch<TResult = never>(onRejected?: Callback<any, TResult> | undefined | null): Promise<T | TResult>;
}

interface PromisePolyfillConstructor extends PromiseConstructor {
  prototype: PromisePolyfill<any>;

  new <T>(executor: Executor<T>): PromisePolyfill<T>;

  immediateFn? (handler: (...args: any[]) => void): void;
}

const promise = <T>(): PromisePolyfillConstructor => {
  const Promise = function (this: PromisePolyfill<T>, fn: Executor<T>) {
    if (typeof this !== 'object') {
      throw new TypeError('Promises must be constructed via new');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('not a function');
    }
    this._state = null;
    this._value = null;
    this._deferreds = [];

    doResolve(fn, bind(resolve, this), bind(reject, this));
  } as unknown as PromisePolyfillConstructor;

  // Use polyfill for setImmediate for performance gains
  const asap = Promise.immediateFn || (typeof window.setImmediate === 'function' && window.setImmediate) ||
    function (fn: (handler: (...args: any[]) => void) => void) { setTimeout(fn, 1); };

  // Polyfill for Function.prototype.bind
  function bind(fn: Function, thisArg: any) {
    return function () {
      return fn.apply(thisArg, arguments);
    };
  }

  const isArray = Array.isArray || function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };

  function handle(this: PromisePolyfill<T>, deferred: Deferred<T>) {
    const me = this;
    if (this._state === null) {
      this._deferreds.push(deferred);
      return;
    }
    asap(function () {
      const cb = me._state ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (me._state ? deferred.resolve : deferred.reject)(me._value);
        return;
      }
      let ret;
      try {
        ret = cb(me._value);
      } catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    });
  }

  function resolve(this: PromisePolyfill<T>, newValue: any) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === this) {
        throw new TypeError('A promise cannot be resolved with itself.');
      }
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        const then = newValue.then;
        if (typeof then === 'function') {
          doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
          return;
        }
      }
      this._state = true;
      this._value = newValue;
      finale.call(this);
    } catch (e) { reject.call(this, e); }
  }

  function reject(this: PromisePolyfill<T>, newValue: any) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }

  function finale(this: PromisePolyfill<T>) {
    for (const deferred of this._deferreds) {
      handle.call(this, deferred);
    }
    this._deferreds = [];
  }

  function Handler<TResult1 = T, TResult2 = never>(this: Deferred<T, TResult1, TResult2>, onFulfilled: Callback<T, TResult1> | null | undefined, onRejected: Callback<any, TResult2> | null | undefined, resolve: ResolveFn<TResult1 | TResult2>, reject: RejectFn) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve<TResult1 = T, TResult2 = never>(fn: Executor<T>, onFulfilled: Callback<T, TResult1>, onRejected: Callback<any, TResult2>) {
    let done = false;
    try {
      fn(function (value) {
        if (done) {
          return;
        }
        done = true;
        onFulfilled(value as T);
      }, function (reason) {
        if (done) {
          return;
        }
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) {
        return;
      }
      done = true;
      onRejected(ex);
    }
  }

  Promise.prototype.catch = function <TResult = never>(onRejected?: Callback<any, TResult> | null): PromisePolyfill<T | TResult> {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function <TResult1 = T, TResult2 = never>(onFulfilled?: Callback<T, TResult1> | null, onRejected?: Callback<any, TResult2> | null): PromisePolyfill<TResult1 | TResult2> {
    const me = this;
    return new Promise(function (resolve, reject) {
      handle.call(me, new (Handler as any)(onFulfilled, onRejected, resolve, reject));
    });
  };

  Promise.all = function <U>(...values: any[]): PromisePolyfill<any> {
    const args = Array.prototype.slice.call(values.length === 1 && isArray(values[0]) ? values[0] : values);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) {
        return resolve([]);
      }
      let remaining = args.length;
      function res(i: number, val: any) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            const then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val: any) { res(i, val); }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (let i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function <U>(value?: U | PromiseLike<U>): PromisePolyfill<U | void> {
    if (value && typeof value === 'object' && (value as {}).constructor === Promise) {
      return value as PromisePolyfill<U | void>;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function <U = never>(reason?: any): PromisePolyfill<U> {
    return new Promise(function (resolve, reject) {
      reject(reason);
    });
  };

  Promise.race = function <U>(values: PromiseLike<U>[]): PromisePolyfill<U> {
    return new Promise(function (resolve, reject) {
      for (const value of values) {
        value.then(resolve, reject);
      }
    });
  };

  return Promise;
};

declare const window: Window & { Promise: PromiseConstructor };

const Promise: PromiseConstructor = window.Promise ? window.Promise : promise();

export {
  Promise
};
