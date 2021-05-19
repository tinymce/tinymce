import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import { arbResultError, arbResultValue } from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertResult } from 'ephox/katamari/test/AssertResult';
import { assertNone } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.data.ResultErrorTest', () => {

  it('unit tests', () => {
    const s = Result.error('error');
    assert.deepEqual(s.is('error'), false);
    assert.deepEqual(s.isValue(), false);
    assert.deepEqual(s.isError(), true);
    assert.deepEqual(s.getOr(6), 6);
    assert.deepEqual(s.getOrThunk(() => 6), 6);
    assert.throws(() => {
      s.getOrDie();
    });
    assert.deepEqual(s.or(Result.value(6)).getOrDie(), 6);
    assert.throws(() => {
      s.orThunk(() => Result.error('Should not get here.')).getOrDie();
    });

    assert.deepEqual(s.fold((e) => e + '!', (v) => v + 6), 'error!');

    assert.throws(() => {
      s.map((v) => v * 2).getOrDie();
    });

    assert.throws(() => {
      s.bind((v) => Result.value('test' + v)).getOrDie();
    });

    assert.isFalse(s.exists(Fun.always));
    assert.isTrue(s.forall(Fun.never),);

    assertNone(Result.error(4).toOptional());
  });

  const getErrorOrDie = (res) => res.fold((err) => err, Fun.die('Was not an error!'));

  it('error.is === false', () => {
    fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
      assert.isFalse(Result.error<number, string>(s).is(i));
    }));
  });

  it('error.isValue === false', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
      assert.isFalse(res.isValue());
    }));
  });

  it('error.isError === true', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
      assert.isTrue(res.isError());
    }));
  });

  it('error.getOr(v) === v', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), fc.json(), (res, json) => {
      assert.deepEqual(res.getOr(json), json);
    }));
  });

  it('error.getOrDie() always throws', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
      assert.throws(() => {
        res.getOrDie();
      });
    }));
  });

  it('error.or(oValue) === oValue', () => {
    fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
      assertResult(Result.error<number, string>(s).or(Result.value(i)), Result.value(i));
    }));
  });

  it('error.orThunk(_ -> v) === v', () => {
    fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
      assertResult(Result.error<number, string>(s).orThunk(() => Result.value(i)), Result.value(i));
    }));
  });

  it('error.fold(_ -> x, die) === x', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), fc.json(), (res, json) => {
      const actual = res.fold(Fun.constant(json), Fun.die('Should not die'));
      assert.deepEqual(actual, json);
    }));
  });

  it('error.map returns an error', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assertResult(Result.error(i).map(Fun.die('should not be called')), Result.error(i));
    }));
  });

  it('error.mapError(f) === f(error)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const f = (x) => x % 3;
      assertResult(Result.error(i).mapError(f), Result.error(f(i)));
    }));
  });

  it('error.each returns undefined', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
      const actual = res.each(Fun.die('should not be called'));
      assert.isUndefined(actual);
    }));
  });

  it('Given f :: s -> RV, error.bind(f) === error', () => {
    fc.assert(fc.property(arbResultError<number, number>(fc.integer()), fc.func(arbResultValue<number, number>(fc.integer())), (res, f) => {
      const actual = res.bind(f);
      assert.deepEqual(getErrorOrDie(actual), getErrorOrDie(res));
    }));
  });

  it('Given f :: s -> RE, error.bind(f) === error', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), fc.func(arbResultError(fc.integer())), (res, f) => {
      const actual = res.bind(f);
      assert.deepEqual(getErrorOrDie(actual), getErrorOrDie(res));
    }));
  });

  it('error.forall === true', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), fc.func(fc.boolean()), (res, f) => {
      assert.isTrue(res.forall(f));
    }));
  });

  it('error.exists === false', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse(Result.error<unknown, number>(i).exists(Fun.die('should not be called')));
    }));
  });

  it('error.toOptional is always none', () => {
    fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
      assertNone(res.toOptional());
    }));
  });
});
