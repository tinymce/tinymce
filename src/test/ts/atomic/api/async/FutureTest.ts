import Arr from 'ephox/katamari/api/Arr';
import Fun from 'ephox/katamari/api/Fun';
import Future from 'ephox/katamari/api/Future';
import Futures from 'ephox/katamari/api/Futures';
import Result from 'ephox/katamari/api/Result';
import AsyncProps from 'ephox/katamari/test/AsyncProps';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('FutureTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var testPure = function () {
    return new Promise(function (resolve, reject) {
      Future.pure('hello').get(function(a) {
        assert.eq('hello', a);
        resolve(true);
      });
    });
  };

  var testGet = function () {
    return new Promise(function (resolve, reject) {
      Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'blah'), 10);
      }).get(function(a) {
        assert.eq('blah', a);
        resolve(true);
      });
    });
  };

  var testMap = function () {
    return new Promise(function (resolve, reject) {
      var fut = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'blah'), 10);
      });

      var f = function(x) {
        return x + 'hello';
      };

      fut.map(f).get(function(a) {
        assert.eq('blahhello', a);
        resolve(true);
      });
    });
  };

  var testBind = function () {
    return new Promise(function (resolve, reject) {
      var fut = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'blah'), 10);
      });

      var f = function(x) {
        return Future.nu(function(callback) {
          callback(x + 'hello');
        });
      };

      fut.bind(f).get(function(a) {
        assert.eq('blahhello', a);
        resolve(true);
      });
    });
  };

  var testAnonBind = function () {
    return new Promise(function (resolve, reject) {
      var called = false;

      var fut = Future.nu(function(callback) {
        called = true;
        setTimeout(Fun.curry(callback, 'blah'), 10);
      });

      var f = Future.nu(function(callback) {
        callback('hello');
      });

      fut.anonBind(f).get(function(a) {
        assert.eq('hello', a);
        assert.eq(true, called);
        resolve(true);
      });
    });
  };

  var testParallel = function () {
    return new Promise(function (resolve, reject) {
      var f = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'apple'), 10);
      });
      var g = Future.nu(function(callback) {
        setTimeout(Fun.curry(callback, 'banana'), 5);
      });
      var h = Future.nu(function(callback) {
        callback('carrot');
      });


      Futures.par([f, g, h]).get(function(r){
        assert.eq(r[0], 'apple');
        assert.eq(r[1], 'banana');
        assert.eq(r[2], 'carrot');
        resolve(true);
      });
    });
  };

  var testMapM = function () {
    return new Promise(function (resolve, reject) {
      var fn = function(a) {
        return Future.nu(function(cb) {
          setTimeout(Fun.curry(cb, a + ' bizarro'), 10);
        });
      };

      Futures.mapM(['q', 'r', 's'], fn).get(function(r){
        assert.eq(['q bizarro', 'r bizarro', 's bizarro'], r);
        resolve(true);
      });

    });
  };

  var testCompose = function () {
    return new Promise(function (resolve, reject) {
      var f = function(a) {
        return Future.nu(function(cb) {
          setTimeout(Fun.curry(cb, a + ' f'), 10);
        });
      };

      var g = function(a) {
        return Future.nu(function(cb) {
          setTimeout(Fun.curry(cb, a + ' g'), 10);
        });
      };

      Futures.compose(f, g)('a').get(function(r) {
        assert.eq('a g f', r);
        resolve(true);
      });
    });
  };

  var testSpecs = function () {
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

    return AsyncProps.checkProps([
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
    ]);
  };

  testPure().then(testGet).then(testMap).then(testBind).then(testAnonBind).
    then(testParallel).then(testMapM).then(testCompose).then(testSpecs).then(function () {
    success();
  }, failure);
});

