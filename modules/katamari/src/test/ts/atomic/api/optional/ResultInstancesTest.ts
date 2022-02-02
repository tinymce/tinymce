import { describe, it } from '@ephox/bedrock-client';
import { Pprint, Testable } from '@ephox/dispute';
import { assert } from 'chai';
import fc from 'fast-check';

import { Result } from 'ephox/katamari/api/Result';
import { tResult } from 'ephox/katamari/api/ResultInstances';
import { assertResult } from 'ephox/katamari/test/AssertResult';

const { tNumber, tString } = Testable;

describe('atomic.katamari.api.optional.ResultInstancesTest', () => {
  it('value(x) = value(x)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assertResult(Result.value<number, string>(i), Result.value<number, string>(i));
    }));
  });

  it('error(x) = error(x)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assertResult(Result.error<string, number>(i), Result.error<string, number>(i));
    }));
  });

  it('value(a) != error(e)', () => {
    fc.assert(fc.property(fc.integer(), fc.string(), (a, e) => {
      assert.isFalse(tResult(tNumber, tString).eq(
        Result.value<number, string>(a),
        Result.error<number, string>(e)
      ));

      assert.isFalse(tResult(tNumber, tString).eq(
        Result.error<number, string>(e),
        Result.value<number, string>(a)
      ));
    }));
  });

  it('(a = b) = (value(a) = value(b))', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      assert.equal(tResult(tNumber, tString).eq(
        Result.value<number, string>(a),
        Result.value<number, string>(b)
      ), a === b);
    }));
  });

  it('(a = b) = (error(a) = error(b))', () => {
    fc.assert(fc.property(fc.string(), fc.string(), (a, b) => {
      assert.equal(tResult(tNumber, tString).eq(
        Result.error<number, string>(a),
        Result.error<number, string>(b)
      ), a === b);
    }));
  });

  it('ResultInstances.pprint', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.equal(Pprint.render(Result.value(i), tResult(tNumber, tString)), `Result.value(
  ${i}
)`);

      assert.equal(Pprint.render(Result.error(i), tResult(tString, tNumber)), `Result.error(
  ${i}
)`);
    }));
  });
});
