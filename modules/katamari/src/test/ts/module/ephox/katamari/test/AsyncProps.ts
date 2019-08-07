/* tslint:disable:no-unimported-promise */
import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';

export const checkProp = function (label: string, arbitraries: any, f: (x: any) => void) {
  return Jsc.asyncProperty(label, arbitraries, f, { tests: 100 });
};

export const checkProps = function (props) {
  return Arr.foldl(props, function (b, prop) {
    return b.then(function () {
      return checkProp(prop.label, prop.arbs, prop.f);
    });
  }, Promise.resolve(true));
};

export const futureToPromise = function (future) {
  const lazy = future.toLazy();
  return lazyToPromise(lazy);
};

export const lazyToPromise = function (lazy) {
  return new Promise<any>(function (resolve, reject) {
    lazy.get(function (data) {
      resolve(data);
    });
  });
};

const checkPromise = function (answer, predicate) {
  return new Promise<any>(function (resolve, reject) {
    return predicate(answer).fold(
      function (err) { reject(err); },
      function (v) { resolve(true); }
    );
  });
};

export const checkFuture = function (future, predicate) {
  return futureToPromise(future).then(function (answer) {
    return checkPromise(answer, predicate);
  });
};

export const checkLazy = function (lazy, predicate) {
  return lazyToPromise(lazy).then(function (answer) {
    return checkPromise(answer, predicate);
  });
};
