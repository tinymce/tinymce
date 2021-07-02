import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import * as Results from 'ephox/katamari/api/Results';
import { arbResultError, arbResultValue } from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertResult } from 'ephox/katamari/test/AssertResult';

describe('atomic.katamari.api.arr.ResultValueTest', () => {
  it('unit tests', () => {
    const s = Result.value(5);
    assert.isTrue(Results.is(s, 5));
    assert.isTrue(s.isValue());
    assert.isFalse(s.isError());
    assert.equal(s.getOr(6), 5);
    assert.equal(s.getOrThunk(Fun.constant(6)), 5);
    assert.equal(s.getOrDie(), 5);
    assert.equal(s.or(Result.value(6)).getOrDie(), 5);
    assert.equal(s.orThunk(() => Result.error('Should not get here.')).getOrDie(), 5);

    assert.equal(s.fold((_e) => {
      throw new Error('Should not get here!');
    }, (v) => v + 6), 11);

    assert.equal(s.map((v) => v * 2).getOrDie(), 10);

    assert.equal(s.bind((v) => Result.value('test' + v)).getOrDie(), 'test5');

    assert.isTrue(s.exists(Fun.always));
    assert.isFalse(s.forall(Fun.never));

    assert.isTrue(Result.value(5).toOptional().isSome());
  });

  it('Checking value.is(value.getOrDie()) === true', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.isTrue(Results.is(res, res.getOrDie()));
    }));
  });

  it('Checking value.isValue === true', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.isTrue(res.isValue());
    }));
  });

  it('Checking value.isError === false', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.isFalse(res.isError());
    }));
  });

  it('Checking value.getOr(v) === value.value', () => {
    fc.assert(fc.property(fc.integer(), (a) => {
      assert.equal(Result.value(a).getOr(a), a);
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
      assert.equal(res.fold(Fun.die('should not get here'), Fun.identity), actual);
    }));
  });

  it('Checking value.map(f) === f(value.getOrDie())', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.json()), (res, f) => {
      assert.equal(f(res.getOrDie()), res.map(f).getOrDie());
    }));
  });

  it('Checking value.each(f) === undefined', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.json()), (res, f) => {
      const actual = res.each(f);
      assert.isUndefined(actual);
    }));
  });

  it('Given f :: s -> RV, checking value.bind(f).getOrDie() === f(value.getOrDie()).getOrDie()', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(arbResultValue(fc.integer())), (res, f) => {
      assert.equal(f(res.getOrDie()).getOrDie(), res.bind(f).getOrDie());
    }));
  });

  it('Given f :: s -> RE, checking value.bind(f).fold(id, die) === f(value.getOrDie()).fold(id, die)', () => {
    fc.assert(fc.property(arbResultValue<number, number>(fc.integer()), fc.func(arbResultError<number, number>(fc.integer())), (res, f) => {
      const toErrString = (r: Result<number, number>) => r.fold(Fun.identity, Fun.die('Not a Result.error'));
      assert.equal(toErrString(f(res.getOrDie())), toErrString(res.bind(f)));
    }));
  });

  it('Checking value.forall is true iff. f(value.getOrDie() === true)', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.boolean()), (res, f) => {
      assert.equal(res.forall(f), f(res.getOrDie()));
    }));
  });

  it('Checking value.exists is true iff. f(value.getOrDie() === true)', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.boolean()), (res, f) => {
      assert.equal(res.exists(f), f(res.getOrDie()));
    }));
  });

  it('Checking value.toOptional is always Optional.some(value.getOrDie())', () => {
    fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
      assert.equal(res.toOptional().getOrDie(), res.getOrDie());
    }));
  });
});
