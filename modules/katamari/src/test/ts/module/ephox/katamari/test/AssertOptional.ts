import { assert } from 'chai';
import { Optional } from 'ephox/katamari/api/Optional';

export const assertOptional = <T> (actual: Optional<T>, expected: Optional<T>): void => {
  if (!actual.equals(expected)) {
    assert.fail(`Expected ${expected.toString()} but got ${actual.toString()}`);
  }
};

export const assertNone = <T> (actual: Optional<T>): void => {
  assertOptional(actual, Optional.none());
};

export const assertSome = <T> (actual: Optional<T>, expected: T): void => {
  assertOptional(actual, Optional.some(expected));
};
