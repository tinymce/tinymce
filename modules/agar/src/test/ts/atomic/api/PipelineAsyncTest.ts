import { Assert, UnitTest } from '@ephox/bedrock-client';
import { setTimeout } from '@ephox/dom-globals';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';

UnitTest.asynctest('PipelineSuite Test', function (success, failure) {

  const mutator = function (property, value) {
    return Step.stateful(function (state, next, die) {
      state[property] = value;
      setTimeout(function () {
        next(state);
      }, 10);
    });
  };

  Pipeline.async({}, [
    mutator('name', 'testfile'),
    mutator('purpose', 'unknown'),
    mutator('correctness', 'tbd')
  ], function (result) {
    Assert.eq('Should have all state properties', {
      name: 'testfile',
      purpose: 'unknown',
      correctness: 'tbd'
    }, result);
    success();

  }, failure);
});
