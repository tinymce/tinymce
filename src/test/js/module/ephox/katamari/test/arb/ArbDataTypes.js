define(
  'ephox.katamari.test.arb.ArbDataTypes',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.FutureResult',
    'ephox.katamari.api.Result',
    'ephox.wrap.Jsc'
  ],

  function (Fun, FutureResult, Result, Jsc) {
    var show = function (res) {
      return res.fold(function (e) {
        return 'Result.error(' + e + ')';
      }, function (v) {
        return 'Result.value(' + v + ')';
      });
    };

    var arbResultError = Jsc.string.smap(function (e) {
      return Result.error(e);
    }, function (res) {
      return res.fold(Fun.identity, Fun.die('This should not happen'));
    }, show);

    var arbResultValue = Jsc.string.smap(function (e) {
      return Result.value(e);
    }, function (res) {
      return res.fold(Fun.die('This should not happen'), Fun.identity);
    }, show);

    var arbResult = Jsc.oneof([ arbResultError, arbResultValue ]);


    var genFutureResult = arbResult.generator.map(function (result) {
      return FutureResult.nu(function (callback) {
        callback(result);
      });
    });

    var arbFutureResult  = Jsc.bless({
      generator: genFutureResult
    });

    return {
      resultError: arbResultError,
      resultValue: arbResultValue,
      result: arbResult,

      futureResult: arbFutureResult
    };
  }
);