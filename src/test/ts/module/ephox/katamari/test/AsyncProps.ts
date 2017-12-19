import Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';

var checkProp = function (label, arbitraries, f) {
  return Jsc.asyncProperty(label, arbitraries, f, { tests: 100 });
};

var checkProps = function (props) {
  return Arr.foldl(props, function (b, prop) {
    return b.then(function () {
      return checkProp(prop.label, prop.arbs, prop.f);
    });
  }, Promise.resolve(true));
};

var futureToPromise = function (future) {
  var lazy = future.toLazy();
  return lazyToPromise(lazy);
};

var lazyToPromise = function (lazy) {
  return new Promise(function (resolve, reject) {
    lazy.get(function (data) {
      resolve(data);
    });
  });
};

var checkPromise = function (answer, predicate) {
  return new Promise(function (resolve, reject) {
    return predicate(answer).fold(
      function (err) { reject(err); },
      function (v) { resolve(true); }
    );
  });
};

var checkFuture = function (future, predicate) {
  return futureToPromise(future).then(function (answer) {
    return checkPromise(answer, predicate);
  });
};

var checkLazy = function (lazy, predicate) {
  return lazyToPromise(lazy).then(function (answer) {
    return checkPromise(answer, predicate);
  });
};

export default <any> {
  checkProp: checkProp,
  checkProps: checkProps,
  lazyToPromise: lazyToPromise,
  futureToPromise: futureToPromise,
  checkFuture: checkFuture,
  checkLazy: checkLazy
};