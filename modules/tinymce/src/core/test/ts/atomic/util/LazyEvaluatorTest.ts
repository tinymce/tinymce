import { Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import * as LazyEvaluator from 'tinymce/core/util/LazyEvaluator';

UnitTest.asynctest('atomic.tinymce.core.util.LazyEvaluatorTest', function (success, failure) {

  const sTestEvaluateUntil = Step.sync(function () {
    const operations = [
      function (a, b) {
        return a === 1 && b === 'a' ? Optional.some(1) : Optional.none();
      },
      function (a, b) {
        return a === 2 && b === 'b' ? Optional.some(2) : Optional.none();
      },
      function (a, b) {
        return a === 3 && b === 'c' ? Optional.some(3) : Optional.none();
      }
    ];

    Assertions.assertEq('Should return none', true, LazyEvaluator.evaluateUntil(operations, [ 123, 'x' ]).isNone());
    Assertions.assertEq('Should return first item', 1, LazyEvaluator.evaluateUntil(operations, [ 1, 'a' ]).getOrDie(1));
    Assertions.assertEq('Should return second item', 2, LazyEvaluator.evaluateUntil(operations, [ 2, 'b' ]).getOrDie(2));
    Assertions.assertEq('Should return third item', 3, LazyEvaluator.evaluateUntil(operations, [ 3, 'c' ]).getOrDie(3));
  });

  Pipeline.async({}, [
    sTestEvaluateUntil
  ], function () {
    success();
  }, failure);
});
