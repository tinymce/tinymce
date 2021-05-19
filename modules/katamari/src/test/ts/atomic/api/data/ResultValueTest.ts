import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import { arbResultError, arbResultValue } from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertResult } from 'ephox/katamari/test/AssertResult';

describe('atomic.katamari.api.arr.ResultValueTest', () => {
  it('unit tests', () => {
    const s = Result.value(5);
    assert.deepEqual(s.is(5), true);
    assert.deepEqual(s.isValue(), true);
    assert.deepEqual(s.isError(), false);
    assert.deepEqual(s.getOr(6), 5);
    assert.deepEqual(s.getOrThunk(() => 6), 5);
    assert.deepEqual(s.getOrDie(), 5);
    assert.deepEqual(s.or(Result.value(6)).getOrDie(), 5);
    assert.deepEqual(s.orThunk(() => Result.error('Should not get here.')).getOrDie(), 5);

    assert.deepEqual(s.fold((_e) => {
      throw new Error('Should not get here!');
    }, (v) => v + 6), 11);

    assert.deepEqual(s.map((v) => v * 2).getOrDie(), 10);

    assert.deepEqual(s.bind((v) => Result.value('test' + v)).getOrDie(), 'test5');

    assert.deepEqual(s.exists(Fun.always), true);
    assert.deepEqual(s.forall(Fun.never), false);

    assert.deepEqual(Result.value(5).toOptional().isSome(), true);
  });

  it('Checking value.is(value.getOrDie()) === true', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.deepEqual(res.is(res.getOrDie()), true);
    }));
  });

  it('Checking value.isValue === true', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.deepEqual(res.isValue(), true);
    }));
  });

  it('Checking value.isError === false', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.deepEqual(res.isError(), false);
    }));
  });

  it('Checking value.getOr(v) === value.value', () => {
    fc.assert(fc.property(fc.integer(), (a) => {
      assert.deepEqual(Result.value(a).getOr(a), a);
    }));
  });

  it('Checking value.getOrDie() does not throw', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      res.getOrDie();
    }));
  });

  it('Checking value.or(oValue) === value', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      assertResult(Result.value(a).or(Result.value(b)), Result.value(a));
    }));
  });

  it('Checking error.or(value) === value', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      assertResult(Result.error(a).or(Result.value(b)), Result.value(b));
    }));
  });

  it('Checking value.orThunk(die) does not throw', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      res.orThunk(Fun.die('dies'));
    }));
  });

  it('Checking value.fold(die, id) === value.getOrDie()', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      const actual = res.getOrDie();
      assert.deepEqual(res.fold(Fun.die('should not get here'), Fun.identity), actual);
    }));
  });

  it('Checking value.map(f) === f(value.getOrDie())', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.json()), (res, f) => {
      assert.deepEqual(f(res.getOrDie()), res.map(f).getOrDie());
    }));
  });

  it('Checking value.each(f) === undefined', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.json()), (res, f) => {
      const actual = res.each(f);
      assert.deepEqual(actual, undefined);
    }));
  });

  it('Given f :: s -> RV, checking value.bind(f).getOrDie() === f(value.getOrDie()).getOrDie()', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(arbResultValue(fc.integer())), (res, f) => {
      assert.deepEqual(f(res.getOrDie()).getOrDie(), res.bind(f).getOrDie());
    }));
  });

  it('Given f :: s -> RE, checking value.bind(f).fold(id, die) === f(value.getOrDie()).fold(id, die)', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(arbResultError(fc.integer())), (res, f) => {
      const toErrString = (r) => r.fold(Fun.identity, Fun.die('Not a Result.error'));
      assert.deepEqual(toErrString(f(res.getOrDie())), toErrString(res.bind(f)));
    }));
  });

  it('Checking value.forall is true iff. f(value.getOrDie() === true)', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.boolean()), (res, f) => {
      assert.deepEqual(res.forall(f), f(res.getOrDie()));
    }));
  });

  it('Checking value.exists is true iff. f(value.getOrDie() === true)', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.boolean()), (res, f) => {
      assert.deepEqual(res.exists(f), f(res.getOrDie()));
    }));
  });

  it('Checking value.toOptional is always Optional.some(value.getOrDie())', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.deepEqual(res.toOptional().getOrDie(), res.getOrDie());
    }));
  });
});
