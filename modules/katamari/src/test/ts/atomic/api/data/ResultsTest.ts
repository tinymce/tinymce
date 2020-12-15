import { Assert, UnitTest } from '@ephox/bedrock-client';
import fc from 'fast-check';
import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import * as Results from 'ephox/katamari/api/Results';
import { arbResult, arbResultError, arbResultValue } from 'ephox/katamari/test/arb/ArbDataTypes';

UnitTest.test('ResultsTest', () => {
  const actual = Results.partition([
    Result.value('a'),
    Result.value('b'),
    Result.error('e1'),
    Result.error('e2'),
    Result.value('c'),
    Result.value('d')
  ]);

  Assert.eq('eq', 'a', actual.values[0]);
  Assert.eq('eq', 'b', actual.values[1]);
  Assert.eq('eq', 'c', actual.values[2]);
  Assert.eq('eq', 'd', actual.values[3]);
  Assert.eq('eq', 'e1', actual.errors[0]);
  Assert.eq('eq', 'e2', actual.errors[1]);
});

UnitTest.test('Check that values should be empty and  errors should be all if we only generate errors', () => {
  fc.assert(fc.property(
    fc.array(arbResultError(fc.integer())),
    (resErrors) => {
      const actual = Results.partition(resErrors);
      if (actual.values.length !== 0) {
        Assert.fail('Values length should be 0');
      } else if (resErrors.length !== actual.errors.length) {
        Assert.fail('Errors length should be ' + resErrors.length);
      }
      return true;
    }
  ));
});

UnitTest.test('Check that errors should be empty and values should be all if we only generate values', () => {
  fc.assert(fc.property(
    fc.array(arbResultValue(fc.integer())),
    (resValues) => {
      const actual = Results.partition(resValues);
      if (actual.errors.length !== 0) {
        Assert.fail('Errors length should be 0');
      } else if (resValues.length !== actual.values.length) {
        Assert.fail('Values length should be ' + resValues.length);
      }
      return true;
    }
  ));
});

UnitTest.test('Check that the total number of values and errors matches the input size', () => {
  fc.assert(fc.property(
    fc.array(arbResult(fc.integer(), fc.string())),
    (results) => {
      const actual = Results.partition(results);
      Assert.eq('Total number should match size of input', results.length, actual.errors.length + actual.values.length);
    }
  ));
});

UnitTest.test('Check that two errors always equal comparison.bothErrors', () => {
  fc.assert(fc.property(
    arbResultError(fc.integer()),
    arbResultError(fc.integer()),
    (r1, r2) => {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.always,
        firstError: Fun.never,
        secondError: Fun.never,
        bothValues: Fun.never
      });
    }
  ));
});

UnitTest.test('Check that error, value always equal comparison.firstError', () => {
  fc.assert(fc.property(
    arbResultError(fc.integer()),
    arbResultValue(fc.string()),
    (r1, r2) => {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.never,
        firstError: Fun.always,
        secondError: Fun.never,
        bothValues: Fun.never
      });
    }
  ));
});

UnitTest.test('Check that value, error always equal comparison.secondError', () => {
  fc.assert(fc.property(
    arbResultValue(fc.integer()),
    arbResultError(fc.string()),
    (r1, r2) => {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.never,
        firstError: Fun.never,
        secondError: Fun.always,
        bothValues: Fun.never
      });
    }
  ));
});

UnitTest.test('Check that value, value always equal comparison.bothValues', () => {
  fc.assert(fc.property(
    arbResultValue(fc.integer()),
    arbResultValue(fc.integer()),
    (r1, r2) => {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.never,
        firstError: Fun.never,
        secondError: Fun.never,
        bothValues: Fun.always
      });
    }
  ));
});

UnitTest.test('Results.unite', () => {
  fc.assert(fc.property(fc.integer(), (a) => {
    Assert.eq('should be error', a, Results.unite(Result.error<number, number>(a)));
    Assert.eq('should be value', a, Results.unite(Result.value<number, number>(a)));
  }));
});
