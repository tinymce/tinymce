import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ResultValueTest', function() {
  const testSanity = function () {
    const s = Result.value(5);
    assert.eq(true, s.is(5));
    assert.eq(true, s.isValue());
    assert.eq(false, s.isError());
    assert.eq(5, s.getOr(6));
    assert.eq(5, s.getOrThunk(function () { return 6; }));
    assert.eq(5, s.getOrDie());
    assert.eq(5, s.or(Result.value(6)).getOrDie());
    assert.eq(5, s.orThunk(function () {
      return Result.error('Should not get here.');
    }).getOrDie());

    assert.eq(11, s.fold(function (e) {
      throw 'Should not get here!';
    }, function (v) {
      return v + 6;
    }));

    assert.eq(10, s.map(function (v) {
      return v * 2;
    }).getOrDie());

    assert.eq('test5', s.bind(function (v) {
      return Result.value('test' + v);
    }).getOrDie());

    assert.eq(true, s.exists(Fun.always));
    assert.eq(false, s.forall(Fun.never));

    assert.eq(true, Result.value(5).toOption().isSome());      
  };

  const arbResultError = ArbDataTypes.resultError;
  const arbResultValue = ArbDataTypes.resultValue;

  const testSpecs = function () {
    Jsc.property('Checking value.is(value.getOrDie()) === true', arbResultValue, function (res) {
      return Jsc.eq(true, res.is(res.getOrDie()));
    });

    Jsc.property('Checking value.isValue === true', arbResultValue, function (res) {
      return Jsc.eq(true, res.isValue());
    });      

    Jsc.property('Checking value.isError === false', arbResultValue, function (res) {
      return Jsc.eq(false, res.isError());
    });      

    Jsc.property('Checking value.getOr(v) === value.value', arbResultValue, 'json', function (res, json) {
      const inside = res.fold(Fun.die('no'), Fun.identity);
      return Jsc.eq(inside, res.getOr(json)) === true;
    });

    Jsc.property('Checking value.getOrDie() does not throw', arbResultValue, function (res) {
      try {
        res.getOrDie();
        return true;
      } catch (err) {
        return false;
      }
    });

    Jsc.property('Checking value.or(oValue) === value', arbResultValue, 'json', function (res, json) {
      const inside = res.fold(Fun.die('no'), Fun.identity);
      return Jsc.eq(inside, res.or(Result.value(json)).getOr(json)) === true;
    });

    Jsc.property('Checking value.orThunk(die) does not throw', arbResultValue, function (res) {
      try {
        res.orThunk(Fun.die('dies'));
        return true;
      } catch (err) {
        return false;
      }
    });

    Jsc.property('Checking value.fold(die, id) === value.getOrDie()', arbResultValue, 'json', function (res, json) {
      const actual = res.getOrDie();
      return Jsc.eq(actual, res.fold(Fun.die('should not get here'), Fun.identity));
    });

    Jsc.property('Checking value.map(f) === f(value.getOrDie())', arbResultValue, 'json -> json', function (res, f) {
      return Jsc.eq(res.map(f).getOrDie(), f(res.getOrDie()));
    });

    Jsc.property('Checking value.each(f) === undefined', arbResultValue, 'string -> json', function (res, f) {
      const actual = res.each(f);
      return Jsc.eq(undefined, actual);
    });

    Jsc.property('Given f :: s -> RV, checking value.bind(f).getOrDie() === f(value.getOrDie()).getOrDie()', arbResultValue, Jsc.fn(arbResultValue), function (res, f) {
      return Jsc.eq(res.bind(f).getOrDie(), f(res.getOrDie()).getOrDie());
    });

    Jsc.property('Given f :: s -> RE, checking value.bind(f).fold(id, die) === f(value.getOrDie()).fold(id, die)', arbResultValue, Jsc.fn(arbResultError), function (res, f) {
      const toErrString = function (r) {
        return r.fold(Fun.identity, Fun.die('Not a Result.error'));
      };

      return Jsc.eq(toErrString(res.bind(f)), toErrString(f(res.getOrDie())));
    });

    Jsc.property('Checking value.forall is true iff. f(value.getOrDie() === true)', arbResultValue, 'string -> bool', function (res, f) {
      return Jsc.eq(f(res.getOrDie()), res.forall(f));
    });

    Jsc.property('Checking value.exists is true iff. f(value.getOrDie() === true)', arbResultValue, 'string -> bool', function (res, f) {
      return  Jsc.eq(f(res.getOrDie()), res.exists(f));
    });

    Jsc.property('Checking value.toOption is always Option.some(value.getOrDie())', arbResultValue, function (res) {
      return Jsc.eq(res.getOrDie(), res.toOption().getOrDie());
    });
  };

  testSanity();
  testSpecs();
});

