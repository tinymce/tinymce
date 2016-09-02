define(
  'ephox.katamari.test.AsyncProps',

  [
    'ephox.katamari.api.Arr',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!console'
  ],

  function (Arr, Jsc, Promise, console) {
    var checkProp = function (label, arbitraries, f) {
      return Jsc.check(
        Jsc.forall.apply(Jsc, arbitraries.concat([ f ])),
        {
          /*
           * Insert jsverify options here like number of tests, rngState
           *
           */
          tests: 100
        }
      ).then(function (result) {
        // TODO: Update Jsc wrap so that we can disable the OK log without losing the error log
        if (result === true) {
          console.log('✓ [async]: ' + label);
          return Promise.resolve(result);
        }
        else {
          console.log('x [async]: ' + label);
          return Promise.reject(result);
        }
      });
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

    return {
      checkProp: checkProp,
      checkProps: checkProps,
      lazyToPromise: lazyToPromise,
      futureToPromise: futureToPromise,
      checkFuture: checkFuture,
      checkLazy: checkLazy
    };
  }
);