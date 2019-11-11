import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import { arbResultError, arbResultValue } from 'ephox/katamari/test/arb/ArbDataTypes';
import fc from 'fast-check';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import { tResult } from 'ephox/katamari/api/ResultInstances';

UnitTest.test('Result.value: unit tests', () => {
  const s = Result.value(5);
  Assert.eq('eq', true, s.is(5));
  Assert.eq('eq', true, s.isValue());
  Assert.eq('eq', false, s.isError());
  Assert.eq('eq', 5, s.getOr(6));
  Assert.eq('eq', 5, s.getOrThunk(() => 6));
  Assert.eq('eq', 5, s.getOrDie());
  Assert.eq('eq', 5, s.or(Result.value(6)).getOrDie());
  Assert.eq('eq', 5, s.orThunk(() => Result.error('Should not get here.')).getOrDie());

  Assert.eq('eq', 11, s.fold((e) => {
    throw new Error('Should not get here!');
  }, (v) => v + 6));

  Assert.eq('eq', 10, s.map((v) => v * 2).getOrDie());

  Assert.eq('eq', 'test5', s.bind((v) => Result.value('test' + v)).getOrDie());

  Assert.eq('eq', true, s.exists(Fun.always));
  Assert.eq('eq', false, s.forall(Fun.never));

  Assert.eq('eq', true, Result.value(5).toOption().isSome());
});

UnitTest.test('Checking value.is(value.getOrDie()) === true', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
    Assert.eq('eq', true, res.is(res.getOrDie()));
  }));
});

UnitTest.test('Checking value.isValue === true', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
    Assert.eq('eq', true, res.isValue());
  }));
});

UnitTest.test('Checking value.isError === false', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
    Assert.eq('eq', false, res.isError());
  }));
});

UnitTest.test('Checking value.getOr(v) === value.value', () => {
  fc.assert(fc.property(fc.integer(), (a) => {
    Assert.eq('eq', a, Result.value(a).getOr(a));
  }));
});

UnitTest.test('Checking value.getOrDie() does not throw', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
    res.getOrDie();
  }));
});

UnitTest.test('Checking value.or(oValue) === value', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    Assert.eq('eq', Result.value(a), Result.value(a).or(Result.value(a)), tResult());
  }));
});

UnitTest.test('Checking value.orThunk(die) does not throw', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
    res.orThunk(Fun.die('dies'));
  }));
});

UnitTest.test('Checking value.fold(die, id) === value.getOrDie()', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.json(), (res, json) => {
    const actual = res.getOrDie();
    Assert.eq('eq', actual, res.fold(Fun.die('should not get here'), Fun.identity));
  }));
});

UnitTest.test('Checking value.map(f) === f(value.getOrDie())', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.json()), (res, f) => {
    Assert.eq('eq', res.map(f).getOrDie(), f(res.getOrDie()));
  }));
});

UnitTest.test('Checking value.each(f) === undefined', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.json()), (res, f) => {
    const actual = res.each(f);
    Assert.eq('eq', undefined, actual);
  }));
});

UnitTest.test('Given f :: s -> RV, checking value.bind(f).getOrDie() === f(value.getOrDie()).getOrDie()', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(arbResultValue(fc.integer())), (res, f) => {
    Assert.eq('eq', res.bind(f).getOrDie(), f(res.getOrDie()).getOrDie());
  }));
});

UnitTest.test('Given f :: s -> RE, checking value.bind(f).fold(id, die) === f(value.getOrDie()).fold(id, die)', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(arbResultError(fc.integer())), (res, f) => {
    const toErrString = (r) => r.fold(Fun.identity, Fun.die('Not a Result.error'));
    Assert.eq('eq', toErrString(res.bind(f)), toErrString(f(res.getOrDie())));
  }));
});

UnitTest.test('Checking value.forall is true iff. f(value.getOrDie() === true)', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.boolean()), (res, f) => {
    Assert.eq('eq', f(res.getOrDie()), res.forall(f));
  }));
});

UnitTest.test('Checking value.exists is true iff. f(value.getOrDie() === true)', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), fc.func(fc.boolean()), (res, f) => {
    Assert.eq('eq', f(res.getOrDie()), res.exists(f));
  }));
});

UnitTest.test('Checking value.toOption is always Option.some(value.getOrDie())', () => {
  fc.assert(fc.property(arbResultValue(fc.integer()), (res) => {
    Assert.eq('eq', res.getOrDie(), res.toOption().getOrDie());
  }));
});
