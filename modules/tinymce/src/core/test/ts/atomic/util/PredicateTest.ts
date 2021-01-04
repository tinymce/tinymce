import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';

import * as Predicate from 'tinymce/core/util/Predicate';

describe('atomic.tinymce.core.util.PredicateTest', () => {
  const isAbove = (target: () => number, value: () => number) => {
    return value() > target();
  };

  const isAbove5 = Fun.curry(isAbove, Fun.constant(5));
  const isAbove10 = Fun.curry(isAbove, Fun.constant(10));

  it('Predicate.and', () => {
    assert.isFalse(Predicate.and(isAbove10, isAbove5)(Fun.constant(10)), 'Should be expected and result');
    assert.isTrue(Predicate.and(isAbove10, isAbove5)(Fun.constant(30)), 'Should be expected and result');
  });

  it('Predicate.or', () => {
    assert.isFalse(Predicate.or(isAbove10, isAbove5)(Fun.constant(5)), 'Should be expected or result');
    assert.isTrue(Predicate.or(isAbove10, isAbove5)(Fun.constant(15)), 'Should be expected or result');
    assert.isTrue(Predicate.or(isAbove5, isAbove10)(Fun.constant(15)), 'Should be expected or result');
  });
});
