import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Fun } from '@ephox/katamari';
import Predicate from 'tinymce/core/util/Predicate';

UnitTest.test('atomic.tinymce.core.util.PredicateTest', () => {
  const isAbove = function (target, value) {
    return value() > target();
  };

  const isAbove5 = Fun.curry(isAbove, Fun.constant(5));
  const isAbove10 = Fun.curry(isAbove, Fun.constant(10));

  RawAssertions.assertEq('Should be extected and result', false, Predicate.and(isAbove10, isAbove5)(Fun.constant(10)));
  RawAssertions.assertEq('Should be extected and result', true, Predicate.and(isAbove10, isAbove5)(Fun.constant(30)));

  RawAssertions.assertEq('Should be extected or result', false, Predicate.or(isAbove10, isAbove5)(Fun.constant(5)));
  RawAssertions.assertEq('Should be extected or result', true, Predicate.or(isAbove10, isAbove5)(Fun.constant(15)));
  RawAssertions.assertEq('Should be extected or result', true, Predicate.or(isAbove5, isAbove10)(Fun.constant(15)));
});
