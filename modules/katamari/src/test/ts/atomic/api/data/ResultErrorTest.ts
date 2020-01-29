import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import { Option } from 'ephox/katamari/api/Option';
import { arbResultValue, arbResultError } from 'ephox/katamari/test/arb/ArbDataTypes';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { tResult } from 'ephox/katamari/api/ResultInstances';
import { tOption } from 'ephox/katamari/api/OptionInstances';
import { Testable } from '@ephox/dispute';

const { tNumber } = Testable;

UnitTest.test('Result.error: unit tests', () => {
  const s = Result.error('error');
  Assert.eq('eq', false, s.is('error'));
  Assert.eq('eq', false, s.isValue());
  Assert.eq('eq', true, s.isError());
  Assert.eq('eq', 6, s.getOr(6));
  Assert.eq('eq', 6, s.getOrThunk(() => 6));
  Assert.throws('', () => {
    s.getOrDie();
  });
  Assert.eq('eq', 6, s.or(Result.value(6)).getOrDie());
  Assert.throws('', () => {
    s.orThunk(() => Result.error('Should not get here.')).getOrDie();
  });

  Assert.eq('eq', 'error!', s.fold((e) => e + '!', (v) => v + 6));

  Assert.throws('', () => {
    s.map((v) => v * 2).getOrDie();
  });

  Assert.throws('', () => {
    s.bind((v) => Result.value('test' + v)).getOrDie();
  });

  Assert.eq('eq', false, s.exists(Fun.always));
  Assert.eq('eq', true, s.forall(Fun.never));

  Assert.eq('eq', Option.none(), Result.error(4).toOption(), tOption(tNumber));
});

const getErrorOrDie = (res) => res.fold((err) => err, Fun.die('Was not an error!'));

UnitTest.test('Result.error: error.is === false', () => {
  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.eq('eq', false, Result.error<number, string>(s).is(i));
  }));
});

UnitTest.test('Result.error: error.isValue === false', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
    Assert.eq('eq', false, res.isValue());
  }));
});

UnitTest.test('Result.error: error.isError === true', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
    Assert.eq('eq', true, res.isError());
  }));
});

UnitTest.test('Result.error: error.getOr(v) === v', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), fc.json(), (res, json) => {
    Assert.eq('eq', json, res.getOr(json));
  }));
});

UnitTest.test('Result.error: error.getOrDie() always throws', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
    Assert.throws('should throw', () => {
      res.getOrDie();
    });
  }));
});

UnitTest.test('Result.error: error.or(oValue) === oValue', () => {
  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.eq('eq', Result.value(i), Result.error<number, string>(s).or(Result.value(i)), tResult());
  }));
});

UnitTest.test('Result.error: error.orThunk(_ -> v) === v', () => {
  fc.assert(fc.property(fc.integer(), fc.string(), (i, s) => {
    Assert.eq('eq', Result.value(i), Result.error<number, string>(s).orThunk(() => Result.value(i)), tResult());
  }));
});

UnitTest.test('Result.error: error.fold(_ -> x, die) === x', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), fc.json(), (res, json) => {
    const actual = res.fold(Fun.constant(json), Fun.die('Should not die'));
    Assert.eq('eq', json, actual);
  }));
});

UnitTest.test('Result.error: error.map(⊥) === error', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', Result.error(i), Result.error(i).map(Fun.die('⊥')), tResult());
  }));
});

UnitTest.test('Result.error: error.mapError(f) === f(error)', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    const f = (x) => x % 3;
    Assert.eq('eq', Result.error(f(i)), Result.error(i).mapError(f), tResult());
  }));
});

UnitTest.test('Result.error: error.each(⊥) === undefined', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
    const actual = res.each(Fun.die('⊥'));
    Assert.eq('eq', undefined, actual);
  }));
});

UnitTest.test('Given f :: s -> RV, Result.error: error.bind(f) === error', () => {
  fc.assert(fc.property(arbResultError<number, number>(fc.integer()), fc.func(arbResultValue<number, number>(fc.integer())), (res, f) => {
    const actual = res.bind(f);
    Assert.eq('eq', true, getErrorOrDie(res) === getErrorOrDie(actual));
  }));
});

UnitTest.test('Given f :: s -> RE, Result.error: error.bind(f) === error', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), fc.func(arbResultError(fc.integer())), (res, f) => {
    const actual = res.bind(f);
    Assert.eq('eq', true, getErrorOrDie(res) === getErrorOrDie(actual));
  }));
});

UnitTest.test('Result.error: error.forall === true', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), fc.func(fc.boolean()), (res, f) => {
    Assert.eq('eq', true, res.forall(f));
  }));
});

UnitTest.test('Result.error: error.exists === false', () => {
  fc.assert(fc.property(fc.integer(), (i) => {
    Assert.eq('eq', false, Result.error<unknown, number>(i).exists(Fun.die('⊥')));
  }));
});

UnitTest.test('Result.error: error.toOption is always none', () => {
  fc.assert(fc.property(arbResultError(fc.integer()), (res) => {
    Assert.eq('eq', Option.none(), res.toOption(), tOption());
  }));
});
