import Fun from 'ephox/katamari/api/Fun';
import Option from 'ephox/katamari/api/Option';
import FutureResult from 'ephox/katamari/api/FutureResult';
import Result from 'ephox/katamari/api/Result';
import Jsc from '@ephox/wrap-jsverify';

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


var genFutureResultSchema = arbResult.generator.map(function (result) {
  var futureResult = FutureResult.nu(function (callback) {
    callback(result);
  });

  return {
    futureResult: futureResult,
    contents: result
  };
});

var genFutureResult = arbResult.generator.map(function (result) {
  return FutureResult.nu(function (callback) {
    callback(result);
  });
});

var arbFutureResult  = Jsc.bless({
  generator: genFutureResult
});

var arbFutureResultSchema = Jsc.bless({
  generator: genFutureResultSchema
});


var arbNone = Jsc.constant(Option.none());
var arbSome = Jsc.json.smap(function (v) {
  return Option.some(v);
}, function (option) {
  return option.getOrDie();
});

var arbOption = Jsc.oneof([ arbNone, arbSome ]);

var genIndexArrayOf = function (len) {
  return Jsc.integer(0, len).generator.map(function (aLength) {
    var r = [ ];
    for (var i = 0; i < aLength; i++) {
      r.push(i);
    }
    return r;
  });
};

var arbIndexArrayOf = function (len) {
  return Jsc.bless({
    generator: genIndexArrayOf(len)
  });
};

export default <any> {
  option: arbOption,
  optionSome: arbSome,
  optionNone: arbNone,

  indexArrayOf: arbIndexArrayOf,
  resultError: arbResultError,
  resultValue: arbResultValue,
  result: arbResult,

  futureResult: arbFutureResult,
  futureResultSchema: arbFutureResultSchema
};