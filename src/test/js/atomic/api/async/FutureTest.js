asynctest(
  'FutureTest',
 
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Futures',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!setTimeout'
  ],
 
  function (Arr, Future, Futures, AsyncProps, Jsc, Promise, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var futureToPromise = function (future) {
      var lazy = future.toLazy();
      return new Promise(function (resolve, reject) {
        lazy.get(function (data) {
          resolve(data);
        });
      });
    };

    var genFutureSchema = Jsc.json.generator.map(function (json) {
      var future = Future.nu(function (done) {
        setTimeout(function () {
          done(json);
        }, 10);
      });

      return {
        future: future,
        contents: json
      };
    });

    var genFuture = Jsc.json.generator.map(function (json) {
      return Future.nu(function (done) {
        setTimeout(function () {
          done(json);
        }, 10);
      });
    });

    var arbFuture = Jsc.bless({
      generator: genFuture
    });

    var arbFutureSchema = Jsc.bless({
      generator: genFutureSchema
    });

    AsyncProps.checkProps([
      {
        label: 'Future.pure resolves with data',
        arbs: [ Jsc.json ],
        f: function (json) {
          return futureToPromise(Future.pure(json)).then(function (data) {
            return Jsc.eq(json, data) ? Promise.resolve(true) : Promise.reject();
          });
        }
      },

      {
        label: 'Future.pure map f resolves with f data',
        arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
        f: function (json, f) {
          return futureToPromise(Future.pure(json).map(f)).then(function (data) {
            return Jsc.eq(f(json), data) ? Promise.resolve(true) : Promise.reject();
          });
        }
      },

      {
        label: 'future.bind(binder) equiv future.get(bind)',
        arbs: [ arbFutureSchema, Jsc.fun(arbFuture) ],
        f: function (arbF, binder) {
          return futureToPromise(arbF.future.bind(binder)).then(function (data) {
            return new Promise(function (resolve, reject) {
              binder(arbF.contents).toLazy().get(function (bInitial) {
                return Jsc.eq(data, bInitial) ? resolve(true): reject('Data did not match');
              });
            });
          });
        }
      },

      {
        label: 'futures.par([future]).get() === [future.val]',
        arbs: [ Jsc.array(arbFutureSchema) ],
        f: function (futures) {
          var rawFutures = Arr.map(futures, function (ft) { return ft.future; });
          var expected = Arr.map(futures, function (ft) { return ft.contents; });
          return futureToPromise(Futures.par(rawFutures)).then(function (list) {
            return new Promise(function (resolve, reject) {
              return Jsc.eq(expected, list) ? resolve(true) : reject('Expected: ' + expected.join(',') +
                ', actual: ' + list.join(',')
              );
            });
          });
        }
      }


    ]).then(function () {
      success();
    }, function (err) {
      console.error('failed');
      failure(err);
    });
  }
);