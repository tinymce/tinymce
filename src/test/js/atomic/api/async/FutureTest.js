asynctest(
  'FutureTest',
 
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Futures',
    'ephox.katamari.api.Result',
    'ephox.katamari.test.AsyncProps',
    'ephox.wrap.Jsc',
    'global!Promise',
    'global!setTimeout'
  ],
 
  function (Arr, Future, Futures, Result, AsyncProps, Jsc, Promise, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

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
          return AsyncProps.checkFuture(Future.pure(json), function (data) {
            return Jsc.eq(json, data) ? Result.value(true) : Result.error('Payload is not the same');
          });
        }
      },

      {
        label: 'Future.pure map f resolves with f data',
        arbs: [ Jsc.json, Jsc.fun(Jsc.json) ],
        f: function (json, f) {
          return AsyncProps.checkFuture(Future.pure(json).map(f), function (data) {
            return Jsc.eq(f(json), data) ? Result.value(true) : Result.error('f(json) !== data');
          });
        }
      },

      {
        label: 'future.bind(binder) equiv future.get(bind)',
        arbs: [ arbFutureSchema, Jsc.fun(arbFuture) ],
        f: function (arbF, binder) {
          return AsyncProps.futureToPromise(arbF.future.bind(binder)).then(function (data) {
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
          return AsyncProps.checkFuture(Futures.par(rawFutures), function (list) {
            return Jsc.eq(expected, list) ? Result.value(true) : Result.error(
              'Expected: ' + expected.join(',') +', actual: ' + list.join(',')
            );
          });
        }
      },

      {
        label: 'futures.mapM([json], json -> future).get(length) === [json].length',
        arbs: [ Jsc.array(arbFuture), Jsc.fun(arbFuture) ],
        f: function (inputs, g) {
          var fResult = Futures.mapM(inputs, g);
          return AsyncProps.checkFuture(fResult, function (list) {
            return Jsc.eq(inputs.length, list.length) ? Result.value(true) : Result.error('input length was not the same as output length');
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