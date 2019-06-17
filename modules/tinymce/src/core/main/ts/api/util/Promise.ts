/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * Modifed to be a feature fill and wrapped as tinymce module.
 *
 * Promise polyfill under MIT license: https://github.com/taylorhakes/promise-polyfill
 */

// tslint:disable: no-unimported-promise

import { setImmediate, setTimeout } from '@ephox/dom-globals';

declare const window: any;

const promise = function () {
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  const isArray = Array.isArray || function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };

  const Promise: any = function (fn) {
    if (typeof this !== 'object') { throw new TypeError('Promises must be constructed via new'); }
    if (typeof fn !== 'function') { throw new TypeError('not a function'); }
    this._state = null;
    this._value = null;
    this._deferreds = [];

    doResolve(fn, bind(resolve, this), bind(reject, this));
  };

  // Use polyfill for setImmediate for performance gains
  const asap = Promise.immediateFn || (typeof setImmediate === 'function' && setImmediate) ||
  function (fn) { setTimeout(fn, 1); };

  function handle(deferred) {
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

  function resolve(newValue) {
    try { // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === this) { throw new TypeError('A promise cannot be resolved with itself.'); }
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

  function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }

  function finale() {
    for (let i = 0, len = this._deferreds.length; i < len; i++) {
      handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, resolve, reject) {
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
  function doResolve(fn, onFulfilled, onRejected) {
    let done = false;
    try {
      fn(function (value) {
        if (done) { return; }
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) { return; }
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) { return; }
      done = true;
      onRejected(ex);
    }
  }

  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    const me = this;
    return new Promise(function (resolve, reject) {
      handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    });
  };

  Promise.all = function () {
    const args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) { return resolve([]); }
      let remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            const then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) { res(i, val); }, reject);
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

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (let i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  return Promise;
};

const promiseObj = window.Promise ? window.Promise : promise();
export default promiseObj as PromiseConstructor;
