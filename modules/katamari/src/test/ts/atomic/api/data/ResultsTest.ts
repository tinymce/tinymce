import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import * as Results from 'ephox/katamari/api/Results';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ResultsTest', function () {
  const testPartition = function () {
    const actual = Results.partition([
      Result.value('a'),
      Result.value('b'),
      Result.error('e1'),
      Result.error('e2'),
      Result.value('c'),
      Result.value('d')
    ]);

    assert.eq('a', actual.values[0]);
    assert.eq('b', actual.values[1]);
    assert.eq('c', actual.values[2]);
    assert.eq('d', actual.values[3]);
    assert.eq('e1', actual.errors[0]);
    assert.eq('e2', actual.errors[1]);
  };

  testPartition();

  const arbResultError = ArbDataTypes.resultError;
  const arbResultValue = ArbDataTypes.resultValue;
  const arbResult = ArbDataTypes.result;

  Jsc.property(
    'Check that values should be empty and  errors should be all if we only generate errors',
    Jsc.array(arbResultError),
    function (resErrors) {
      const actual = Results.partition(resErrors);
      if (!Jsc.eq(0, actual.values.length)) {
        return 'Values length should be 0';
      } else if (!Jsc.eq(resErrors.length, actual.errors.length)) {
        return 'Errors length should be ' + resErrors.length;
      }
      return true;
    }
  );

  Jsc.property(
    'Check that errors should be empty and values should be all if we only generate values',
    Jsc.array(arbResultValue),
    function (resValues) {
      const actual = Results.partition(resValues);
      if (!Jsc.eq(0, actual.errors.length)) {
        return 'Errors length should be 0';
      } else if (!Jsc.eq(resValues.length, actual.values.length)) {
        return 'Values length should be ' + resValues.length;
      }
      return true;
    }
  );

  Jsc.property(
    'Check that the total number of values and errors matches the input size',
    Jsc.array(arbResult),
    function (results) {
      const actual = Results.partition(results);
      return Jsc.eq(results.length, actual.errors.length + actual.values.length) ? true : 'Total number should match size of input';
    }
  );

  Jsc.property(
    'Check that two errors always equal comparison.bothErrors',
    arbResultError,
    arbResultError,
    function (r1, r2) {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.constant(true),
        firstError: Fun.constant(false),
        secondError: Fun.constant(false),
        bothValues: Fun.constant(false)
      });
    }
  );

  Jsc.property(
    'Check that error, value always equal comparison.firstError',
    arbResultError,
    arbResultValue,
    function (r1, r2) {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.constant(false),
        firstError: Fun.constant(true),
        secondError: Fun.constant(false),
        bothValues: Fun.constant(false)
      });
    }
  );

  Jsc.property(
    'Check that value, error always equal comparison.secondError',
    arbResultValue,
    arbResultError,
    function (r1, r2) {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.constant(false),
        firstError: Fun.constant(false),
        secondError: Fun.constant(true),
        bothValues: Fun.constant(false)
      });
    }
  );

  Jsc.property(
    'Check that value, value always equal comparison.bothValues',
    arbResultValue,
    arbResultValue,
    function (r1, r2) {
      const comparison = Results.compare(r1, r2);
      return comparison.match({
        bothErrors: Fun.constant(false),
        firstError: Fun.constant(false),
        secondError: Fun.constant(false),
        bothValues: Fun.constant(true)
      });
    }
  );
});
