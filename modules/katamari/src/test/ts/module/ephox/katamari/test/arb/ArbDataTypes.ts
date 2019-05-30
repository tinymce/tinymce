import * as Fun from 'ephox/katamari/api/Fun';
import { Option } from 'ephox/katamari/api/Option';
import { FutureResult } from 'ephox/katamari/api/FutureResult';
import { Result } from 'ephox/katamari/api/Result';
import Jsc from '@ephox/wrap-jsverify';

const show = function (res) {
  return res.fold(function (e) {
    return 'Result.error(' + e + ')';
  }, function (v) {
    return 'Result.value(' + v + ')';
  });
};

export const resultError = Jsc.string.smap(function (e) {
  return Result.error(e);
}, function (res) {
  return res.fold(Fun.identity, Fun.die('This should not happen'));
}, show);

export const resultValue = Jsc.string.smap(function (e) {
  return Result.value(e);
}, function (res) {
  return res.fold(Fun.die('This should not happen'), Fun.identity);
}, show);

export const result = Jsc.oneof([ resultError, resultValue ]);


const genFutureResultSchema = result.generator.map(function (result) {
  const futureResult = FutureResult.nu(function (callback) {
    callback(result);
  });

  return {
    futureResult: futureResult,
    contents: result
  };
});

const genFutureResult = result.generator.map(function (result) {
  return FutureResult.nu(function (callback) {
    callback(result);
  });
});

export const futureResult  = Jsc.bless({
  generator: genFutureResult
});

export const futureResultSchema = Jsc.bless({
  generator: genFutureResultSchema
});


export const optionNone = Jsc.constant(Option.none());
export const optionSome = Jsc.json.smap(function (v) {
  return Option.some(v);
}, function (option) {
  return option.getOrDie();
});

export const option = Jsc.oneof([ optionNone, optionSome ]);

const genIndexArrayOf = function (len) {
  return Jsc.integer(0, len).generator.map(function (aLength) {
    const r = [ ];
    for (let i = 0; i < aLength; i++) {
      r.push(i);
    }
    return r;
  });
};

export const indexArrayOf = function (len) {
  return Jsc.bless({
    generator: genIndexArrayOf(len)
  });
};
