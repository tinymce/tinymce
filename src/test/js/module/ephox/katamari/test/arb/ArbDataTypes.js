define(
  'ephox.katamari.test.arb.ArbDataTypes',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.wrap.Jsc'
  ],

  function (Fun, Result, Jsc) {
    var show = function (res) {
      return res.fold(function (e) {
        return 'Result.error(' + e + ')';
      }, function (v) {
        return 'Result.value(' + v + ')';
      });
    };

    var resultError = Jsc.string.smap(function (e) {
      return Result.error(e);
    }, function (res) {
      return res.fold(Fun.identity, Fun.die('This should not happen'));
    }, show);

    var resultValue = Jsc.string.smap(function (e) {
      return Result.value(e);
    }, function (res) {
      return res.fold(Fun.die('This should not happen'), Fun.identity);
    }, show);

    return {
      resultError: resultError,
      resultValue: resultValue
    };
  }
);