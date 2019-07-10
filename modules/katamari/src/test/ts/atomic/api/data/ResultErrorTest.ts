import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Result.error tests', function () {
  const testSanity = function () {
    const s = Result.error('error');
    assert.eq(false, s.is('error'));
    assert.eq(false, s.isValue());
    assert.eq(true, s.isError());
    assert.eq(6, s.getOr(6));
    assert.eq(6, s.getOrThunk(function () { return 6; }));
    assert.throws(function () {
      s.getOrDie();
    });
    assert.eq(6, s.or(Result.value(6)).getOrDie());
    assert.throws(function () {
      s.orThunk(function () {
        return Result.error('Should not get here.');
      }).getOrDie();
    });

    assert.eq('error!', s.fold(function (e) {
      return e + '!';
    }, function (v) {
      return v + 6;
    }));

    assert.throws(function () {
      s.map(function (v) {
        return v * 2;
      }).getOrDie();
    });

    assert.throws(function () {
      s.bind(function (v) {
        return Result.value('test' + v);
      }).getOrDie();
    });

    assert.eq(false, s.exists(Fun.always));
    assert.eq(true, s.forall(Fun.never));

    assert.eq(true, Result.error(4).toOption().isNone());
  };

  const arbResultError = ArbDataTypes.resultError;
  const arbResultValue = ArbDataTypes.resultValue;

  const getErrorOrDie = function (res) {
    return res.fold(function (err) {
      return err;
    }, Fun.die('Was not an error!'));
  };

  const testSpecs = function () {
    Jsc.property('Checking error.is === false', arbResultError, function (res) {
      const v = res.fold(Fun.identity, Fun.die('should be result.error'));
      return Jsc.eq(false, res.is(v));
    });

    Jsc.property('Checking error.isValue === false', arbResultError, function (res) {
      return Jsc.eq(false, res.isValue());
    });

    Jsc.property('Checking error.isError === true', arbResultError, function (res) {
      return Jsc.eq(true, res.isError());
    });

    Jsc.property('Checking error.getOr(v) === v', arbResultError, 'json', function (res, json) {
      return Jsc.eq(json, res.getOr(json));
    });

    Jsc.property('Checking error.getOrDie() always throws', arbResultError, function (res) {
      try {
        res.getOrDie();
        return false;
      } catch (err) {
        return true;
      }
    });

    Jsc.property('Checking error.or(oValue) === oValue', arbResultError, 'json', function (res, json) {
      const output = res.or(Result.value(json));
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking error.orThunk(_ -> v) === v', arbResultError, 'json', function (res, json) {
      const output = res.orThunk(function () {
        return Result.value(json);
      });
      return Jsc.eq(true, output.is(json));
    });

    Jsc.property('Checking error.fold(_ -> x, die) === x', arbResultError, 'json', function (res, json) {
      const actual = res.fold(Fun.constant(json), Fun.die('Should not die'));
      return Jsc.eq(json, actual);
    });

    Jsc.property('Checking error.map(f) === error', arbResultError, 'string -> json', function (res, f) {
      const actual = res.map(f);
      return Jsc.eq(true, actual.fold(function (e) {
        return e === res.fold(Fun.identity, Fun.die('should not get here!'));
      }), Fun.constant(false));
    });

    Jsc.property('Checking error.map(f) === error', arbResultError, 'string -> json', function (res, f) {
      const actual = res.map(f);
      return Jsc.eq(true, getErrorOrDie(res) === getErrorOrDie(actual));
    });

    Jsc.property('Checking error.mapError(f) === f(error)', arbResultError, 'string -> json', function (res, f) {
      return Jsc.eq(res.mapError(f).fold(Fun.identity, Fun.constant(false)), f(res.fold(Fun.identity, Fun.constant(true))));
    });

    Jsc.property('Checking error.each(f) === undefined', arbResultError, 'string -> json', function (res, f) {
      const actual = res.each(f);
      return Jsc.eq(undefined, actual);
    });

    Jsc.property('Given f :: s -> RV, checking error.bind(f) === error', arbResultError, Jsc.fn(arbResultValue), function (res, f) {
      const actual = res.bind(f);
      return Jsc.eq(true, getErrorOrDie(res) === getErrorOrDie(actual));
    });

    Jsc.property('Given f :: s -> RE, checking error.bind(f) === error', arbResultError, Jsc.fn(arbResultError), function (res, f) {
      const actual = res.bind(f);
      return Jsc.eq(true, getErrorOrDie(res) === getErrorOrDie(actual));
    });

    Jsc.property('Checking error.forall === true', arbResultError, 'string -> bool', function (res, f) {
      return Jsc.eq(true, res.forall(f));
    });

    Jsc.property('Checking error.exists === false', arbResultError, 'string -> bool', function (res, f) {
      return Jsc.eq(false, res.exists(f));
    });

    Jsc.property('Checking error.toOption is always none', arbResultError, function (res) {
      return Jsc.eq(true, res.toOption().isNone());
    });
  };

  testSanity();
  testSpecs();
});
