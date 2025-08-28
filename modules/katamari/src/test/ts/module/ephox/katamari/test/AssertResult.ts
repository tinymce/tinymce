import { Testable } from '@ephox/dispute';
import { assert } from 'chai';

import { Result } from 'ephox/katamari/api/Result';
import { tResult } from 'ephox/katamari/api/ResultInstances';

type Testable<A> = Testable.Testable<A>;

export const assertResult = <A, E> (actual: Result<A, E>, expected: Result<A, E>, testableA: Testable<A> = Testable.tAny, testableE: Testable<E> = Testable.tAny): void => {
  if (!tResult(testableA, testableE).eq(actual, expected)) {
    assert.fail(`Expected ${expected.toString()} but got ${actual.toString()}`);
  }
};
