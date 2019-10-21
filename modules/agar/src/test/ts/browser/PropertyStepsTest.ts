import { Assert, UnitTest } from '@ephox/bedrock-client';
import Jsc from '@ephox/wrap-jsverify';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as PropertySteps from 'ephox/agar/api/PropertySteps';
import { Step } from 'ephox/agar/api/Step';

UnitTest.asynctest('PropertyStepsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  // NOTE: Make this fail to test output errors.
  Pipeline.async({}, [
    PropertySteps.sAsyncProperty(
      'Check number dividing by 1 is itself',
      [Jsc.integer],
      Step.stateful((num: number, next, die) => {
        Assert.eq('x / 1 === x', num, num / 1);
        next(num);
      }),
      {}
    )
  ], function () { success(); }, failure);
});
