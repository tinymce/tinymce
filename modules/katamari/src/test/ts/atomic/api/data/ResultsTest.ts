import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Result } from 'ephox/katamari/api/Result';
import * as Results from 'ephox/katamari/api/Results';
import { arbResult, arbResultError, arbResultValue } from 'ephox/katamari/test/arb/ArbDataTypes';

describe('atomic.katamari.api.data.ResultsTest', () => {

  it('ResultsTest', () => {
    const actual = Results.partition([
      Result.value('a'),
      Result.value('b'),
      Result.error('e1'),
      Result.error('e2'),
      Result.value('c'),
      Result.value('d')
    ]);

    assert.equal(actual.values[0], 'a');
    assert.equal(actual.values[1], 'b');
    assert.equal(actual.values[2], 'c');
    assert.equal(actual.values[3], 'd');
    assert.equal(actual.errors[0], 'e1');
    assert.equal(actual.errors[1], 'e2');
  });

  it('Check that values should be empty and  errors should be all if we only generate errors', () => {
    fc.assert(fc.property(
      fc.array(arbResultError(fc.integer())),
      (resErrors) => {
        const actual = Results.partition(resErrors);
        if (actual.values.length !== 0) {
          assert.fail('Values length should be 0');
        } else if (resErrors.length !== actual.errors.length) {
          assert.fail('Errors length should be ' + resErrors.length);
        }
        return true;
      }
    ));
  });

  it('Check that errors should be empty and values should be all if we only generate values', () => {
    fc.assert(fc.property(
      fc.array(arbResultValue(fc.integer())),
      (resValues) => {
        const actual = Results.partition(resValues);
        if (actual.errors.length !== 0) {
          assert.fail('Errors length should be 0');
        } else if (resValues.length !== actual.values.length) {
          assert.fail('Values length should be ' + resValues.length);
        }
        return true;
      }
    ));
  });

  it('Check that the total number of values and errors matches the input size', () => {
    fc.assert(fc.property(
      fc.array(arbResult(fc.integer(), fc.string())),
      (results) => {
        const actual = Results.partition(results);
        assert.equal(actual.errors.length + actual.values.length, results.length);
      }
    ));
  });

  it('Check that two errors always equal comparison.bothErrors', () => {
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

  it('Check that error, value always equal comparison.firstError', () => {
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

  it('Check that value, error always equal comparison.secondError', () => {
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

  it('Check that value, value always equal comparison.bothValues', () => {
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

  it('Results.unite', () => {
    fc.assert(fc.property(fc.integer(), (a) => {
      assert.equal(Results.unite(Result.error<number, number>(a)), a);
      assert.equal(Results.unite(Result.value<number, number>(a)), a);
    }));
  });
});
