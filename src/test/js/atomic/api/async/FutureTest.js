asynctest(
  'FutureTest',
 
  [
    'ephox.katamari.api.Future',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!setTimeout'
  ],
 
  function (Future, AsyncProps, Jsc, Promise, setTimeout) {
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
        arbs: [ arbFuture, Jsc.fun(arbFuture) ],
        f: function (future, binder) {
          return futureToPromise(future.bind(binder)).then(function (data) {
            return new Promise(function (resolve, reject) {
              future.toLazy().get(function (initial) {
                binder(initial).toLazy().get(function (bInitial) {
                  return Jsc.eq(data, bInitial) ? resolve(true): reject('Data did not match');
                });
              });
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