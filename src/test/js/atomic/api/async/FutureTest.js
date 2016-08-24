asynctest(
  'FutureTest',
 
  [
    'ephox.katamari.api.Future',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise'
  ],
 
  function (Future, AsyncProps, Jsc, Promise) {
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
      }


    ]).then(function () {
      success();
    }, function (err) {
      console.error('failed');
      failure(err);
    });
  }
);