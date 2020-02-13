import { Assert, UnitTest } from '@ephox/bedrock-client';
import { setTimeout } from '@ephox/dom-globals';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';

UnitTest.asynctest('PipelineSuite Test', (success, failure) => {

  const mutator = (property, value) =>
    Step.stateful((state, next, die) => {
      state[property] = value;
      setTimeout(() => {
        next(state);
      }, 10);
    });

  Pipeline.async({}, [
    mutator('name', 'testfile'),
    mutator('purpose', 'unknown'),
    mutator('correctness', 'tbd')
  ], (result) => {
    Assert.eq('Should have all state properties', {
      name: 'testfile',
      purpose: 'unknown',
      correctness: 'tbd'
    }, result);
    success();

  }, failure);
});
