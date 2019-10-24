import { Assertions, Pipeline, Step } from '@ephox/agar';
import { Option } from '@ephox/katamari';
import LazyEvaluator from 'tinymce/core/util/LazyEvaluator';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('atomic.tinymce.core.util.LazyEvaluatorTest', function (success, failure) {

  const sTestEvaluateUntil = Step.sync(function () {
    const operations = [
      function (a, b) {
        return a === 1 && b === 'a' ? Option.some(1) : Option.none();
      },
      function (a, b) {
        return a === 2 && b === 'b' ? Option.some(2) : Option.none();
      },
      function (a, b) {
        return a === 3 && b === 'c' ? Option.some(3) : Option.none();
      }
    ];

    Assertions.assertEq('Should return none', true, LazyEvaluator.evaluateUntil(operations, [123, 'x']).isNone());
    Assertions.assertEq('Should return first item', 1, LazyEvaluator.evaluateUntil(operations, [1, 'a']).getOrDie(1));
    Assertions.assertEq('Should return second item', 2, LazyEvaluator.evaluateUntil(operations, [2, 'b']).getOrDie(2));
    Assertions.assertEq('Should return third item', 3, LazyEvaluator.evaluateUntil(operations, [3, 'c']).getOrDie(3));
  });

  Pipeline.async({}, [
    sTestEvaluateUntil
  ], function () {
    success();
  }, failure);
});
